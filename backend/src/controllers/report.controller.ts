import { Response } from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { TimesheetEntry, LeaveRequest, User } from '../models';
import { ApiResponse } from '../utils/response.util';
import { IAuthRequest, UserRole, LeaveStatus } from '../types';
import moment from 'moment';

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

      const entries = await TimesheetEntry.find(query)
        .populate('userId', 'firstName lastName email employeeId')
        .populate('projectId', 'name code')
        .sort({ date: -1 });

      // Calculate summary
      const summary = {
        totalHours: entries.reduce((sum: number, entry: any) => sum + entry.hoursWorked, 0),
        billableHours: entries.filter(e => e.isBillable).reduce((sum: number, entry: any) => sum + entry.hoursWorked, 0),
        nonBillableHours: entries.filter(e => !e.isBillable).reduce((sum: number, entry: any) => sum + entry.hoursWorked, 0),
        totalEntries: entries.length
      };

      const reportData = {
        summary,
        entries,
        dateRange: { startDate, endDate }
      };

      if (format === 'pdf') {
        await ReportController.generateTimesheetPDF(reportData, res);
        return;
      } else if (format === 'excel') {
        await ReportController.generateTimesheetExcel(reportData, res);
        return;
      }

      return ApiResponse.success(res, reportData, 'Timesheet report generated successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to generate timesheet report');
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
        totalDays: leaves.reduce((sum: number, leave: any) => sum + leave.totalDays, 0),
        approved: leaves.filter((l: any) => l.status === LeaveStatus.APPROVED).length,
        pending: leaves.filter((l: any) => l.status === LeaveStatus.PENDING).length,
        rejected: leaves.filter((l: any) => l.status === LeaveStatus.REJECTED).length,
        byType: {} as any
      };

      // Group by leave type
      leaves.forEach((leave: any) => {
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
        await ReportController.generateLeavePDF(reportData, res);
        return;
      } else if (format === 'excel') {
        await ReportController.generateLeaveExcel(reportData, res);
        return;
      }

      return ApiResponse.success(res, reportData, 'Leave report generated successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to generate leave report');
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
      const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
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
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              employeeId: user.employeeId,
              role: user.role
            },
            timesheetSummary: {
              totalHours: timesheetEntries.reduce((sum: number, e: any) => sum + e.hoursWorked, 0),
              billableHours: timesheetEntries.filter(e => e.isBillable).reduce((sum: number, e: any) => sum + e.hoursWorked, 0),
              entriesCount: timesheetEntries.length
            },
            leaveSummary: {
              totalLeaves: leaveRequests.length,
              totalDays: leaveRequests.reduce((sum: number, l: any) => sum + l.totalDays, 0),
              pending: leaveRequests.filter((l: any) => l.status === LeaveStatus.PENDING).length
            }
          };
        })
      );

      const reportData = {
        teamSize: users.length,
        teamMembers: teamData
      };

      if (format === 'pdf') {
        await ReportController.generateTeamPDF(reportData, res);
        return;
      } else if (format === 'excel') {
        await ReportController.generateTeamExcel(reportData, res);
        return;
      }

      return ApiResponse.success(res, reportData, 'Team report generated successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to generate team report');
    }
  }

  /**
   * Generate Timesheet PDF
   */
  private static async generateTimesheetPDF(data: any, res: Response): Promise<void> {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=timesheet-report-${Date.now()}.pdf`);
    
    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Timesheet Report', { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(10);
    doc.text(`Total Hours: ${data.summary.totalHours}`);
    doc.text(`Billable Hours: ${data.summary.billableHours}`);
    doc.text(`Non-Billable Hours: ${data.summary.nonBillableHours}`);
    doc.text(`Total Entries: ${data.summary.totalEntries}`);
    doc.moveDown();

    // Entries
    doc.fontSize(14).text('Entries', { underline: true });
    doc.fontSize(8);
    
    data.entries.forEach((entry: any, index: number) => {
      if (index > 0 && index % 20 === 0) {
        doc.addPage();
      }
      doc.text(
        `${moment(entry.date).format('YYYY-MM-DD')} | ${entry.userId?.firstName} ${entry.userId?.lastName} | ${entry.hoursWorked}h | ${entry.projectId?.name || 'N/A'}`
      );
    });

    doc.end();
  }

  /**
   * Generate Timesheet Excel
   */
  private static async generateTimesheetExcel(data: any, res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Timesheet Report');

    // Headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Employee', key: 'employee', width: 25 },
      { header: 'Project', key: 'project', width: 20 },
      { header: 'Hours', key: 'hours', width: 10 },
      { header: 'Billable', key: 'billable', width: 10 },
      { header: 'Description', key: 'description', width: 40 }
    ];

    // Data
    data.entries.forEach((entry: any) => {
      worksheet.addRow({
        date: moment(entry.date).format('YYYY-MM-DD'),
        employee: `${entry.userId?.firstName} ${entry.userId?.lastName}`,
        project: entry.projectId?.name || 'N/A',
        hours: entry.hoursWorked,
        billable: entry.isBillable ? 'Yes' : 'No',
        description: entry.description
      });
    });

    // Summary row
    worksheet.addRow({});
    worksheet.addRow({
      date: 'SUMMARY',
      hours: data.summary.totalHours,
      billable: `${data.summary.billableHours} billable`
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=timesheet-report-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Generate Leave PDF
   */
  private static async generateLeavePDF(data: any, res: Response): Promise<void> {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=leave-report-${Date.now()}.pdf`);
    
    doc.pipe(res);

    doc.fontSize(20).text('Leave Report', { align: 'center' });
    doc.moveDown();

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
    
    data.leaves.forEach((leave: any, index: number) => {
      if (index > 0 && index % 15 === 0) {
        doc.addPage();
      }
      doc.text(
        `${moment(leave.startDate).format('YYYY-MM-DD')} to ${moment(leave.endDate).format('YYYY-MM-DD')} | ${leave.userId?.firstName} ${leave.userId?.lastName} | ${leave.leaveType} | ${leave.totalDays} days | ${leave.status}`
      );
    });

    doc.end();
  }

  /**
   * Generate Leave Excel
   */
  private static async generateLeaveExcel(data: any, res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leave Report');

    worksheet.columns = [
      { header: 'Employee', key: 'employee', width: 25 },
      { header: 'Leave Type', key: 'leaveType', width: 15 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Days', key: 'days', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Reason', key: 'reason', width: 40 }
    ];

    data.leaves.forEach((leave: any) => {
      worksheet.addRow({
        employee: `${leave.userId?.firstName} ${leave.userId?.lastName}`,
        leaveType: leave.leaveType,
        startDate: moment(leave.startDate).format('YYYY-MM-DD'),
        endDate: moment(leave.endDate).format('YYYY-MM-DD'),
        days: leave.totalDays,
        status: leave.status,
        reason: leave.reason
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
  private static async generateTeamPDF(data: any, res: Response): Promise<void> {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=team-report-${Date.now()}.pdf`);
    
    doc.pipe(res);

    doc.fontSize(20).text('Team Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Team Size: ${data.teamSize}`, { underline: true });
    doc.moveDown();

    data.teamMembers.forEach((member: any, index: number) => {
      if (index > 0 && index % 8 === 0) {
        doc.addPage();
      }
      
      doc.fontSize(12).text(`${member.user.name} (${member.user.employeeId})`, { underline: true });
      doc.fontSize(10);
      doc.text(`Email: ${member.user.email}`);
      doc.text(`Role: ${member.user.role}`);
      doc.text(`Timesheet - Total Hours: ${member.timesheetSummary.totalHours}, Billable: ${member.timesheetSummary.billableHours}`);
      doc.text(`Leave - Total Leaves: ${member.leaveSummary.totalLeaves}, Pending: ${member.leaveSummary.pending}`);
      doc.moveDown();
    });

    doc.end();
  }

  /**
   * Generate Team Excel
   */
  private static async generateTeamExcel(data: any, res: Response): Promise<void> {
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

    data.teamMembers.forEach((member: any) => {
      worksheet.addRow({
        employeeId: member.user.employeeId,
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





