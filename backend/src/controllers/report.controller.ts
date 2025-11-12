import { Response } from 'express';
import { ApiResponse } from '../utils/response.util';
import { IAuthRequest, UserRole } from '../types';
import { toTimesheetReportResponse, toLeaveReportResponse, toTeamReportResponse } from '../dto';
import { ReportService } from '../services';
import { generateTimesheetPDF, generateLeavePDF, generateTeamPDF } from '../utils/pdf-export.util';
import { generateTimesheetExcel, generateLeaveExcel, generateTeamExcel } from '../utils/excel-export.util';

export class ReportController {
  /**
   * Generate timesheet report
   */
  static async getTimesheetReport(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { startDate, endDate, userId, format = 'json' } = req.query as any;

      const reportService = new ReportService();
      const reportData = await reportService.getTimesheetReport({
        tenantId: req.user?.tenantId || '',
        startDate,
        endDate,
        userId,
        userRole: req.user?.role as UserRole,
        currentUserId: req.user?.userId
      });

      if (format === 'pdf') {
        const responseData = toTimesheetReportResponse(reportData.summary, reportData.entries, reportData.dateRange);
        await generateTimesheetPDF(responseData, res);
        return;
      } else if (format === 'excel') {
        const responseData = toTimesheetReportResponse(reportData.summary, reportData.entries, reportData.dateRange);
        await generateTimesheetExcel(responseData, res);
        return;
      }

      const responseData = toTimesheetReportResponse(reportData.summary, reportData.entries, reportData.dateRange);
      return ApiResponse.success(res, responseData, 'Timesheet report generated successfully');
    } catch (error) {
      console.error('Timesheet report error:', error);
      if (!res.headersSent) {
        return ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to generate timesheet report');
      }
      console.error('Error occurred after response stream started:', error);
    }
  }

  /**
   * Generate leave report
   */
  static async getLeaveReport(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { startDate, endDate, userId, leaveType, format = 'json' } = req.query as any;

      const reportService = new ReportService();
      const reportData = await reportService.getLeaveReport({
        tenantId: req.user?.tenantId || '',
        startDate,
        endDate,
        userId,
        leaveType,
        userRole: req.user?.role as UserRole,
        currentUserId: req.user?.userId
      });

      if (format === 'pdf') {
        const responseData = toLeaveReportResponse(reportData.summary, reportData.leaves, reportData.dateRange);
        await generateLeavePDF(responseData, res);
        return;
      } else if (format === 'excel') {
        const responseData = toLeaveReportResponse(reportData.summary, reportData.leaves, reportData.dateRange);
        await generateLeaveExcel(responseData, res);
        return;
      }

      const responseData = toLeaveReportResponse(reportData.summary, reportData.leaves, reportData.dateRange);
      return ApiResponse.success(res, responseData, 'Leave report generated successfully');
    } catch (error) {
      console.error('Leave report error:', error);
      if (!res.headersSent) {
        return ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to generate leave report');
      }
      console.error('Error occurred after response stream started:', error);
    }
  }

  /**
   * Generate team report (Supervisor/HR/Admin)
   */
  static async getTeamReport(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { departmentId, format = 'json' } = req.query as any;

      const reportService = new ReportService();
      const reportData = await reportService.getTeamReport({
        tenantId: req.user?.tenantId || '',
        departmentId,
        userRole: req.user?.role as UserRole,
        currentUserId: req.user?.userId
      });

      if (format === 'pdf') {
        const responseData = toTeamReportResponse(reportData.teamSize, reportData.teamMembers);
        await generateTeamPDF(responseData, res);
        return;
      } else if (format === 'excel') {
        const responseData = toTeamReportResponse(reportData.teamSize, reportData.teamMembers);
        await generateTeamExcel(responseData, res);
        return;
      }

      const responseData = toTeamReportResponse(reportData.teamSize, reportData.teamMembers);
      return ApiResponse.success(res, responseData, 'Team report generated successfully');
    } catch (error) {
      console.error('Team report error:', error);
      if (!res.headersSent) {
        return ApiResponse.error(res, error instanceof Error ? error.message : 'Failed to generate team report');
      }
      console.error('Error occurred after response stream started:', error);
    }
  }
}
