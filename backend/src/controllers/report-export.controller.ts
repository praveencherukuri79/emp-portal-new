/**
 * Report Export Controller
 * Handles PDF and Excel export for reports
 */

import { Response } from 'express';
import { TimesheetEntry, LeaveRequest, User } from '../models';
import { ApiResponse, RequestValidator, BusinessLogic } from '../utils';
import { IAuthRequest, TimesheetStatus, LeaveStatus } from '../types';
import { generateTimesheetPDF, generateLeavePDF, generateTeamPDF } from '../utils/pdf-export.util';
import { generateTimesheetExcel, generateLeaveExcel, generateTeamExcel } from '../utils/excel-export.util';

export class ReportExportController {
  /**
   * Export timesheet report
   * POST /api/v1/reports/timesheet/export
   */
  static async exportTimesheetReport(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { format, userId, startDate, endDate, project, status } = req.body;

      // Validate format
      if (!format || !['pdf', 'excel'].includes(format)) {
        ApiResponse.validationError(res, ['Format must be "pdf" or "excel"']);
        return;
      }

      // Build query
      const query: any = { tenantId: req.user!.tenantId };
      
      if (userId) query.userId = userId;
      if (project) query.project = project;
      if (status) query.status = status;
      
      if (startDate && endDate) {
        const dateValidation = RequestValidator.validateDateRange(startDate, endDate);
        if (!dateValidation.valid) {
          ApiResponse.validationError(res, [dateValidation.error!]);
          return;
        }
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      // Get entries
      const entries = await TimesheetEntry.find(query)
        .populate('userId', 'firstName lastName email employeeId')
        .sort({ date: -1 });

      // Calculate summary
      const summary = BusinessLogic.calculateWeekTotalHours(entries);

      // Transform to expected format
      const transformedEntries = entries.map(e => ({
        _id: String(e._id),
        userId: String(e.userId),
        date: e.date,
        project: e.project,
        task: e.task,
        description: e.description,
        hours: e.hours,
        hoursWorked: e.hours,
        isBillable: e.isBillable,
        status: e.status
      }));

      const reportData = {
        entries: transformedEntries,
        summary: {
          totalHours: summary.total,
          billableHours: summary.billable,
          nonBillableHours: summary.nonBillable,
          totalEntries: entries.length
        },
        dateRange: { startDate, endDate }
      };

      // Generate report
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=timesheet_report_${new Date().toISOString().split('T')[0]}.pdf`);
        await generateTimesheetPDF(reportData, res);
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=timesheet_report_${new Date().toISOString().split('T')[0]}.xlsx`);
        await generateTimesheetExcel(reportData, res);
      }
    } catch (error) {
      console.error('Export timesheet report error:', error);
      ApiResponse.error(res, 'Failed to export timesheet report', 500);
    }
  }

  /**
   * Export leave report
   * POST /api/v1/reports/leave/export
   */
  static async exportLeaveReport(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { format, userId, startDate, endDate, leaveType, status } = req.body;

      // Validate format
      if (!format || !['pdf', 'excel'].includes(format)) {
        ApiResponse.validationError(res, ['Format must be "pdf" or "excel"']);
        return;
      }

      // Build query
      const query: any = { tenantId: req.user!.tenantId };
      
      if (userId) query.userId = userId;
      if (leaveType) query.leaveType = leaveType;
      if (status) query.status = status;
      
      if (startDate && endDate) {
        const dateValidation = RequestValidator.validateDateRange(startDate, endDate);
        if (!dateValidation.valid) {
          ApiResponse.validationError(res, [dateValidation.error!]);
          return;
        }
        query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      // Get leave requests
      const leaves = await LeaveRequest.find(query)
        .populate('userId', 'firstName lastName email employeeId')
        .populate('approvedBy', 'firstName lastName')
        .populate('rejectedBy', 'firstName lastName')
        .sort({ startDate: -1 });

      // Calculate summary by type
      const grouped = BusinessLogic.groupBy(leaves, 'leaveType');
      const byType: Record<string, { count: number; totalDays: number }> = {};
      
      for (const [type, typeLeaves] of Object.entries(grouped)) {
        byType[type] = {
          count: typeLeaves.length,
          totalDays: BusinessLogic.sum(typeLeaves.map((l: any) => l.totalDays))
        };
      }

      // Transform leaves to expected format
      const transformedLeaves = leaves.map(l => ({
        _id: String(l._id),
        userId: l.userId,
        leaveType: l.leaveType,
        startDate: l.startDate,
        endDate: l.endDate,
        totalDays: l.totalDays,
        status: l.status,
        reason: l.reason
      }));

      const reportData = {
        leaves: transformedLeaves,
        summary: {
          totalLeaves: leaves.length,
          totalDays: BusinessLogic.sum(leaves.map(l => l.totalDays)),
          approved: leaves.filter(l => l.status === LeaveStatus.APPROVED).length,
          pending: leaves.filter(l => l.status === LeaveStatus.PENDING).length,
          rejected: leaves.filter(l => l.status === LeaveStatus.REJECTED).length,
          byType
        },
        dateRange: { startDate, endDate }
      };

      // Generate report
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=leave_report_${new Date().toISOString().split('T')[0]}.pdf`);
        await generateLeavePDF(reportData, res);
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=leave_report_${new Date().toISOString().split('T')[0]}.xlsx`);
        await generateLeaveExcel(reportData, res);
      }
    } catch (error) {
      console.error('Export leave report error:', error);
      ApiResponse.error(res, 'Failed to export leave report', 500);
    }
  }

  /**
   * Export team report
   * POST /api/v1/reports/team/export
   */
  static async exportTeamReport(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { format, startDate, endDate, department } = req.body;

      // Validate format
      if (!format || !['pdf', 'excel'].includes(format)) {
        ApiResponse.validationError(res, ['Format must be "pdf" or "excel"']);
        return;
      }

      // Build user query
      const userQuery: any = { tenantId: req.user!.tenantId };
      if (department) userQuery.department = department;

      const users = await User.find(userQuery)
        .select('_id firstName lastName email employeeId role department');

      // Build timesheet query
      const timesheetQuery: any = {
        tenantId: req.user!.tenantId,
        userId: { $in: users.map(u => u._id) }
      };

      if (startDate && endDate) {
        const dateValidation = RequestValidator.validateDateRange(startDate, endDate);
        if (!dateValidation.valid) {
          ApiResponse.validationError(res, [dateValidation.error!]);
          return;
        }
        timesheetQuery.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      const timesheets = await TimesheetEntry.find(timesheetQuery);
      const leaves = await LeaveRequest.find({
        tenantId: req.user!.tenantId,
        userId: { $in: users.map(u => u._id) },
        startDate: startDate ? { $gte: new Date(startDate) } : undefined,
        endDate: endDate ? { $lte: new Date(endDate) } : undefined
      });

      // Build team data
      const teamData = users.map((user: any) => {
        const userTimesheets = timesheets.filter((t: any) => String(t.userId) === String(user._id));
        const userLeaves = leaves.filter((l: any) => String(l.userId) === String(user._id));
        const hoursSummary = BusinessLogic.calculateWeekTotalHours(userTimesheets);

        return {
          user: {
            id: String(user._id),
            name: user.fullName,
            email: user.email,
            employeeId: user.employeeId,
            role: user.role
          },
          timesheetSummary: {
            totalHours: hoursSummary.total,
            billableHours: hoursSummary.billable,
            entriesCount: userTimesheets.length
          },
          leaveSummary: {
            totalLeaves: userLeaves.length,
            totalDays: BusinessLogic.sum(userLeaves.map((l: any) => l.totalDays)),
            pending: userLeaves.filter(l => l.status === LeaveStatus.PENDING).length
          }
        };
      });

      const reportData = {
        teamSize: users.length,
        teamMembers: teamData,
        dateRange: { startDate, endDate },
        department,
        generatedAt: new Date(),
        generatedBy: req.user!.email
      };

      // Generate report
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=team_report_${new Date().toISOString().split('T')[0]}.pdf`);
        await generateTeamPDF(reportData, res);
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=team_report_${new Date().toISOString().split('T')[0]}.xlsx`);
        await generateTeamExcel(reportData, res);
      }
    } catch (error) {
      console.error('Export team report error:', error);
      ApiResponse.error(res, 'Failed to export team report', 500);
    }
  }
}

