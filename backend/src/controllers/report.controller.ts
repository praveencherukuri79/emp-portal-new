import { Response } from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { TimesheetEntry, LeaveRequest, User } from '../models';
import { ApiResponse } from '../utils/response.util';
import { IAuthRequest, UserRole, LeaveStatus } from '../types';
import { toTimesheetReportResponse, toLeaveReportResponse, toTeamReportResponse } from '../dto';
import dayjs from 'dayjs';

export class ReportController {
  /**
   * Generate timesheet report
   */
  static async getTimesheetReport(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { startDate, endDate, userId, format = 'json' } = req.query as any;

      const query: any = {
        tenantId: req.user?.tenantId
      };

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Filter by user if specified or if not HR/Admin
      if (userId) {
        query.userId = userId;
      } else if (![UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER].includes(req.user?.role as UserRole)) {
        query.userId = req.user?.userId;
      }

      // Note: userId is a String, not ObjectId, so populate may not work as expected
      // We'll handle user data separately if needed
      const entries = await TimesheetEntry.find(query)
        .sort({ date: -1 });

      // Calculate summary
      const summary = {
        totalHours: entries.reduce((sum: number, entry) => sum + entry.hours, 0),
        billableHours: entries.filter(e => e.isBillable).reduce((sum: number, entry) => sum + entry.hours, 0),
        nonBillableHours: entries.filter(e => !e.isBillable).reduce((sum: number, entry) => sum + entry.hours, 0),
        totalEntries: entries.length
      };

      if (format === 'pdf') {
        const responseData = toTimesheetReportResponse(summary, entries, { startDate, endDate });
        await ReportController.generateTimesheetPDF(responseData, res);
        return;
      } else if (format === 'excel') {
        const responseData = toTimesheetReportResponse(summary, entries, { startDate, endDate });
        await ReportController.generateTimesheetExcel(responseData, res);
        return;
      }

      const responseData = toTimesheetReportResponse(summary, entries, { startDate, endDate });
      return ApiResponse.success(res, responseData, 'Timesheet report generated successfully');
    } catch (error) {
      console.error('Timesheet report error:', error);
      // Only send error if response hasn't been sent (i.e., not a PDF/Excel stream)
      if (!res.headersSent) {
        return ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to generate timesheet report');
      }
      // If headers are sent (PDF/Excel stream started), just log the error
      console.error('Error occurred after response stream started:', error);
    }
  }

  /**
   * Generate leave report
   */
  static async getLeaveReport(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { startDate, endDate, userId, leaveType, format = 'json' } = req.query as any;

      const query: any = {
        tenantId: req.user?.tenantId
      };

      if (startDate && endDate) {
        query.$or = [
          {
            startDate: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          },
          {
            endDate: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        ];
      }

      if (userId) {
        query.userId = userId;
      } else if (![UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER].includes(req.user?.role as UserRole)) {
        query.userId = req.user?.userId;
      }

      if (leaveType) query.leaveType = leaveType;

      const leaves = await LeaveRequest.find(query)
        .populate('userId', 'firstName lastName email employeeId')
        .sort({ startDate: -1 });

      // Calculate summary
      const summary = {
        totalLeaves: leaves.length,
        totalDays: leaves.reduce((sum: number, leave) => sum + leave.totalDays, 0),
        approved: leaves.filter((l) => l.status === LeaveStatus.APPROVED).length,
        pending: leaves.filter((l) => l.status === LeaveStatus.PENDING).length,
        rejected: leaves.filter((l) => l.status === LeaveStatus.REJECTED).length,
        byType: {} as Record<string, { count: number; totalDays: number }>
      };

      // Group by leave type
      leaves.forEach((leave) => {
        if (!summary.byType[leave.leaveType]) {
          summary.byType[leave.leaveType] = {
            count: 0,
            totalDays: 0
          };
        }
        summary.byType[leave.leaveType].count++;
        summary.byType[leave.leaveType].totalDays += leave.totalDays;
      });

      const reportData = {
        summary,
        leaves,
        dateRange: { startDate, endDate }
      };

      if (format === 'pdf') {
        const responseData = toLeaveReportResponse(summary, leaves, { startDate, endDate });
        await ReportController.generateLeavePDF(responseData, res);
        return; // Don't send any other response after PDF
      } else if (format === 'excel') {
        const responseData = toLeaveReportResponse(summary, leaves, { startDate, endDate });
        await ReportController.generateLeaveExcel(responseData, res);
        return; // Don't send any other response after Excel
      }

      const responseData = toLeaveReportResponse(summary, leaves, { startDate, endDate });
      return ApiResponse.success(res, responseData, 'Leave report generated successfully');
    } catch (error) {
      console.error('Leave report error:', error);
      // Only send error if response hasn't been sent (i.e., not a PDF/Excel stream)
      if (!res.headersSent) {
        return ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to generate leave report');
      }
      // If headers are sent (PDF/Excel stream started), just log the error
      console.error('Error occurred after response stream started:', error);
    }
  }

  /**
   * Generate team report (Supervisor/HR/Admin)
   */
  static async getTeamReport(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { departmentId, format = 'json' } = req.query as any;

      const query: any = {
        tenantId: req.user?.tenantId,
        isActive: true
      };

      if (departmentId) query.departmentId = departmentId;

      // If supervisor, only show their team
      if (req.user?.role === UserRole.SUPERVISOR) {
        query.supervisorId = req.user.userId;
      }

      const users = await User.find(query).select('-password');

      // Get timesheet summary for each user (last 30 days)
      const thirtyDaysAgo = dayjs().subtract(30, 'days').toDate();
      const teamData = await Promise.all(
        users.map(async (user) => {
          const timesheetEntries = await TimesheetEntry.find({
            tenantId: req.user?.tenantId,
            userId: user._id,
            date: { $gte: thirtyDaysAgo }
          });

          const leaveRequests = await LeaveRequest.find({
            tenantId: req.user?.tenantId,
            userId: user._id,
            startDate: { $gte: thirtyDaysAgo }
          });

          return {
            user: {
              id: String(user._id),
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              employeeId: user.employeeId,
              role: user.role
            },
            timesheetSummary: {
              totalHours: timesheetEntries.reduce((sum: number, e) => sum + e.hours, 0),
              billableHours: timesheetEntries.filter(e => e.isBillable).reduce((sum: number, e) => sum + e.hours, 0),
              entriesCount: timesheetEntries.length
            },
            leaveSummary: {
              totalLeaves: leaveRequests.length,
              totalDays: leaveRequests.reduce((sum: number, l) => sum + l.totalDays, 0),
              pending: leaveRequests.filter((l) => l.status === LeaveStatus.PENDING).length
            }
          };
        })
      );

      const reportData = {
        teamSize: users.length,
        teamMembers: teamData
      };

      if (format === 'pdf') {
        const responseData = toTeamReportResponse(users.length, teamData);
        await ReportController.generateTeamPDF(responseData, res);
        return; // Don't send any other response after PDF
      } else if (format === 'excel') {
        const responseData = toTeamReportResponse(users.length, teamData);
        await ReportController.generateTeamExcel(responseData, res);
        return; // Don't send any other response after Excel
      }

      const responseData = toTeamReportResponse(users.length, teamData);
      return ApiResponse.success(res, responseData, 'Team report generated successfully');
    } catch (error) {
      console.error('Team report error:', error);
      // Only send error if response hasn't been sent (i.e., not a PDF/Excel stream)
      if (!res.headersSent) {
        return ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to generate team report');
      }
      // If headers are sent (PDF/Excel stream started), just log the error
      console.error('Error occurred after response stream started:', error);
    }
  }

  /**
   * Generate Timesheet PDF
   */
  private static async generateTimesheetPDF(data: { summary: { totalHours: number; billableHours: number; nonBillableHours: number; totalEntries: number }; entries: Array<{ _id: string; userId: string; date: Date | string; project: string; task?: string; description?: string; hours: number; hoursWorked?: number; isBillable: boolean; status: string }>; dateRange: { startDate?: string; endDate?: string } }, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if response has already been sent
      if (res.headersSent) {
        return resolve();
      }

      try {
        // Set headers BEFORE creating the PDF document
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=timesheet-report-${Date.now()}.pdf`);
        
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
        });
        
        // Handle PDF document errors
        doc.on('error', (error) => {
          if (!res.headersSent) {
            res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
          }
          reject(error);
        });

        // Handle response stream completion
        res.on('finish', () => {
          resolve();
        });

        res.on('error', (error) => {
          reject(error);
        });

        // Pipe PDF to response
        doc.pipe(res);

        // Title
        doc.fontSize(20).text('Timesheet Report', { align: 'center' });
        doc.moveDown();

        // Date Range
        if (data.dateRange.startDate || data.dateRange.endDate) {
          doc.fontSize(10);
          doc.text(`Date Range: ${data.dateRange.startDate || 'N/A'} to ${data.dateRange.endDate || 'N/A'}`);
          doc.moveDown();
        }

        // Summary
        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(10);
        doc.text(`Total Hours: ${data.summary.totalHours.toFixed(2)}`);
        doc.text(`Billable Hours: ${data.summary.billableHours.toFixed(2)}`);
        doc.text(`Non-Billable Hours: ${data.summary.nonBillableHours.toFixed(2)}`);
        doc.text(`Total Entries: ${data.summary.totalEntries}`);
        doc.moveDown();

        // Entries
        doc.fontSize(14).text('Entries', { underline: true });
        doc.fontSize(8);
        
        if (data.entries.length === 0) {
          doc.fontSize(10).text('No entries found for the selected date range.');
        } else {
          data.entries.forEach((entry, index: number) => {
            if (index > 0 && index % 20 === 0) {
              doc.addPage();
            }
            const date = typeof entry.date === 'string' ? entry.date : dayjs(entry.date).format('YYYY-MM-DD');
            const hours = entry.hoursWorked || entry.hours;
            const taskInfo = entry.task ? ` | Task: ${entry.task}` : '';
            const descInfo = entry.description ? ` | Desc: ${entry.description.substring(0, 30)}` : '';
            doc.text(
              `${date} | User: ${entry.userId} | Project: ${entry.project}${taskInfo} | Hours: ${hours} | Billable: ${entry.isBillable ? 'Yes' : 'No'} | Status: ${entry.status}${descInfo}`
            );
          });
        }

        // Finalize PDF - this will trigger the stream to end
        doc.end();
      } catch (error) {
        if (!res.headersSent) {
          res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
        }
        reject(error);
      }
    });
  }

  /**
   * Generate Timesheet Excel
   */
  private static async generateTimesheetExcel(data: { summary: { totalHours: number; billableHours: number; nonBillableHours: number; totalEntries: number }; entries: Array<{ _id: string; userId: string; date: Date | string; project: string; task?: string; description?: string; hours: number; hoursWorked?: number; isBillable: boolean; status: string }>; dateRange: { startDate?: string; endDate?: string } }, res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Timesheet Report');

    // Headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'User ID', key: 'userId', width: 20 },
      { header: 'Project', key: 'project', width: 20 },
      { header: 'Task', key: 'task', width: 20 },
      { header: 'Hours', key: 'hours', width: 10 },
      { header: 'Billable', key: 'billable', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Description', key: 'description', width: 40 }
    ];

    // Data
    data.entries.forEach((entry) => {
      const date = typeof entry.date === 'string' ? entry.date : dayjs(entry.date).format('YYYY-MM-DD');
      worksheet.addRow({
        date,
        userId: entry.userId,
        project: entry.project,
        task: entry.task || 'N/A',
        hours: entry.hoursWorked || entry.hours,
        billable: entry.isBillable ? 'Yes' : 'No',
        status: entry.status,
        description: entry.description || 'N/A'
      });
    });

    // Summary row
    worksheet.addRow({});
    worksheet.addRow({
      date: 'SUMMARY',
      hours: data.summary.totalHours.toFixed(2),
      billable: `${data.summary.billableHours.toFixed(2)} billable`
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=timesheet-report-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Generate Leave PDF
   */
  private static async generateLeavePDF(data: { summary: { totalLeaves: number; totalDays: number; approved: number; pending: number; rejected: number; byType: Record<string, { count: number; totalDays: number }> }; leaves: Array<{ _id: string; userId: string; leaveType: string; startDate: Date | string; endDate: Date | string; totalDays: number; status: string; reason?: string }>; dateRange: { startDate?: string; endDate?: string } }, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if response has already been sent
      if (res.headersSent) {
        return resolve();
      }

      try {
        // Set headers BEFORE creating the PDF document
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=leave-report-${Date.now()}.pdf`);
        
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
        });
        
        // Handle PDF document errors
        doc.on('error', (error) => {
          if (!res.headersSent) {
            res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
          }
          reject(error);
        });

        // Handle response stream completion
        res.on('finish', () => {
          resolve();
        });

        res.on('error', (error) => {
          reject(error);
        });

        // Pipe PDF to response
        doc.pipe(res);

        doc.fontSize(20).text('Leave Report', { align: 'center' });
        doc.moveDown();

        // Date Range
        if (data.dateRange.startDate || data.dateRange.endDate) {
          doc.fontSize(10);
          doc.text(`Date Range: ${data.dateRange.startDate || 'N/A'} to ${data.dateRange.endDate || 'N/A'}`);
          doc.moveDown();
        }

        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(10);
        doc.text(`Total Leaves: ${data.summary.totalLeaves}`);
        doc.text(`Total Days: ${data.summary.totalDays}`);
        doc.text(`Approved: ${data.summary.approved}`);
        doc.text(`Pending: ${data.summary.pending}`);
        doc.text(`Rejected: ${data.summary.rejected}`);
        doc.moveDown();

        doc.fontSize(14).text('Leave Requests', { underline: true });
        doc.fontSize(8);
        
        if (data.leaves.length === 0) {
          doc.fontSize(10).text('No leave requests found for the selected date range.');
        } else {
          data.leaves.forEach((leave, index: number) => {
            if (index > 0 && index % 15 === 0) {
              doc.addPage();
            }
            const startDate = typeof leave.startDate === 'string' ? leave.startDate : dayjs(leave.startDate).format('YYYY-MM-DD');
            const endDate = typeof leave.endDate === 'string' ? leave.endDate : dayjs(leave.endDate).format('YYYY-MM-DD');
            const reasonInfo = leave.reason ? ` | Reason: ${leave.reason.substring(0, 40)}` : '';
            doc.text(
              `${startDate} to ${endDate} | User: ${leave.userId} | Type: ${leave.leaveType} | Days: ${leave.totalDays} | Status: ${leave.status}${reasonInfo}`
            );
          });
        }

        // Finalize PDF - this will trigger the stream to end
        doc.end();
      } catch (error) {
        if (!res.headersSent) {
          res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
        }
        reject(error);
      }
    });
  }

  /**
   * Generate Leave Excel
   */
  private static async generateLeaveExcel(data: { summary: { totalLeaves: number; totalDays: number; approved: number; pending: number; rejected: number; byType: Record<string, { count: number; totalDays: number }> }; leaves: Array<{ _id: string; userId: string; leaveType: string; startDate: Date | string; endDate: Date | string; totalDays: number; status: string; reason?: string }>; dateRange: { startDate?: string; endDate?: string } }, res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leave Report');

    worksheet.columns = [
      { header: 'User ID', key: 'userId', width: 20 },
      { header: 'Leave Type', key: 'leaveType', width: 15 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Days', key: 'days', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Reason', key: 'reason', width: 40 }
    ];

    data.leaves.forEach((leave) => {
      const startDate = typeof leave.startDate === 'string' ? leave.startDate : dayjs(leave.startDate).format('YYYY-MM-DD');
      const endDate = typeof leave.endDate === 'string' ? leave.endDate : dayjs(leave.endDate).format('YYYY-MM-DD');
      worksheet.addRow({
        userId: leave.userId,
        leaveType: leave.leaveType,
        startDate,
        endDate,
        days: leave.totalDays,
        status: leave.status,
        reason: leave.reason || 'N/A'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=leave-report-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Generate Team PDF
   */
  private static async generateTeamPDF(data: { teamSize: number; teamMembers: Array<{ user: { id: string; name: string; email: string; employeeId?: string; role: string }; timesheetSummary: { totalHours: number; billableHours: number; entriesCount: number }; leaveSummary: { totalLeaves: number; totalDays: number; pending: number } }> }, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if response has already been sent
      if (res.headersSent) {
        return resolve();
      }

      try {
        // Set headers BEFORE creating the PDF document
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=team-report-${Date.now()}.pdf`);
        
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
        });
        
        // Handle PDF document errors
        doc.on('error', (error) => {
          if (!res.headersSent) {
            res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
          }
          reject(error);
        });

        // Handle response stream completion
        res.on('finish', () => {
          resolve();
        });

        res.on('error', (error) => {
          reject(error);
        });

        // Pipe PDF to response
        doc.pipe(res);

        doc.fontSize(20).text('Team Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text(`Team Size: ${data.teamSize}`, { underline: true });
        doc.moveDown();

        if (data.teamMembers.length === 0) {
          doc.fontSize(10).text('No team members found.');
        } else {
          data.teamMembers.forEach((member, index: number) => {
            if (index > 0 && index % 8 === 0) {
              doc.addPage();
            }
            
            doc.fontSize(12).text(`${member.user.name}${member.user.employeeId ? ` (${member.user.employeeId})` : ''}`, { underline: true });
            doc.fontSize(10);
            doc.text(`Email: ${member.user.email}`);
            doc.text(`Role: ${member.user.role}`);
            doc.text(`Timesheet - Total Hours: ${member.timesheetSummary.totalHours.toFixed(2)}, Billable: ${member.timesheetSummary.billableHours.toFixed(2)}, Entries: ${member.timesheetSummary.entriesCount}`);
            doc.text(`Leave - Total Leaves: ${member.leaveSummary.totalLeaves}, Total Days: ${member.leaveSummary.totalDays}, Pending: ${member.leaveSummary.pending}`);
            doc.moveDown();
          });
        }

        // Finalize PDF - this will trigger the stream to end
        doc.end();
      } catch (error) {
        if (!res.headersSent) {
          res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
        }
        reject(error);
      }
    });
  }

  /**
   * Generate Team Excel
   */
  private static async generateTeamExcel(data: { teamSize: number; teamMembers: Array<{ user: { id: string; name: string; email: string; employeeId?: string; role: string }; timesheetSummary: { totalHours: number; billableHours: number; entriesCount: number }; leaveSummary: { totalLeaves: number; totalDays: number; pending: number } }> }, res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Team Report');

    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Total Hours', key: 'totalHours', width: 12 },
      { header: 'Billable Hours', key: 'billableHours', width: 15 },
      { header: 'Leave Days', key: 'leaveDays', width: 12 },
      { header: 'Pending Leaves', key: 'pendingLeaves', width: 15 }
    ];

    data.teamMembers.forEach((member) => {
      worksheet.addRow({
        employeeId: member.user.employeeId || 'N/A',
        name: member.user.name,
        email: member.user.email,
        role: member.user.role,
        totalHours: member.timesheetSummary.totalHours,
        billableHours: member.timesheetSummary.billableHours,
        leaveDays: member.leaveSummary.totalDays,
        pendingLeaves: member.leaveSummary.pending
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=team-report-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }
}





