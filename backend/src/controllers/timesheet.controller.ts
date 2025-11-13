import { Response } from 'express';
import { TimesheetEntry, User } from '../models';
import { ApiResponse, RequestValidator, BusinessLogic, DateUtil } from '../utils';
import { IAuthRequest, TimesheetStatus, ITimesheetEntryDTO, ITimesheetEntry } from '../types';
import { IBatchTimesheetEntriesRequest, IUpdateTimesheetEntryRequest, ISubmitWeekRequest, IApproveTimesheetEntriesRequest, IRejectTimesheetEntriesRequest } from '@shared/types/requests';
import { ITimesheetApprovalActionResponse } from '@shared/types/responses';
import { toTimesheetEntryResponse, toWeeklyTimesheetResponse, toPendingTimesheetGroupResponse } from '../dto';
import { PermissionChecker, userHasPermission } from '../utils/permission.util';
import { UserRole } from '@shared/types';
import { Permission } from '@shared/types/permissions';
import { Document } from 'mongoose';
import NotificationService from '../services/notification.service';
import dayjs from 'dayjs';

export class TimesheetController {
  /**
   * Create timesheet entry
   */
  static async createEntry(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { date, project, task, description, hours, isBillable }: ITimesheetEntryDTO = req.body;

      // Validate tenant and user context
      if (!RequestValidator.validateTenantContext(req, res)) return;
      if (!RequestValidator.validateUserContext(req, res)) return;

      // Validate hours
      const hoursValidation = BusinessLogic.validateTimesheetHours(hours);
      if (!hoursValidation.valid) {
        return ApiResponse.validationError(res, [hoursValidation.error!]);
      }

      // Calculate week information using utility
      const { weekStart, weekEnd, year, weekNumber } = BusinessLogic.getWeekDates(date);

      // Check if entry already exists for this date and project
      const existingEntry = await TimesheetEntry.findOne({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        date,
        project
      });

      if (existingEntry) {
        return ApiResponse.error(res, 'Entry already exists for this date and project', 400);
      }

      const entry = new TimesheetEntry({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        date,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        year,
        weekNumber,
        project,
        task,
        description,
        hours,
        isBillable: isBillable ?? true,
        status: TimesheetStatus.DRAFT
      });

      await entry.save();

      const responseData = toTimesheetEntryResponse(entry);
      return ApiResponse.created(res, responseData, 'Timesheet entry created successfully');
    } catch (error) {
      console.error('Create timesheet entry error:', error);
      return ApiResponse.error(res, 'Failed to create timesheet entry', 500);
    }
  }

  /**
   * Batch create entries (Quick Entry feature)
   */
  static async batchCreateEntries(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { entries }: IBatchTimesheetEntriesRequest = req.body;

      // Validate tenant and user context
      if (!RequestValidator.validateTenantContext(req, res)) return;
      if (!RequestValidator.validateUserContext(req, res)) return;

      if (!Array.isArray(entries) || entries.length === 0) {
        return ApiResponse.validationError(res, ['Entries array is required and must not be empty']);
      }

      const createdEntries = [];
      const errors: string[] = [];
      
      for (const entryData of entries) {
        // Validate hours
        const hoursValidation = BusinessLogic.validateTimesheetHours(entryData.hours);
        if (!hoursValidation.valid) {
          errors.push(`Entry for ${entryData.date}: ${hoursValidation.error}`);
          continue;
        }

        // Calculate week information using utility
        const { weekStart, weekEnd, year, weekNumber } = BusinessLogic.getWeekDates(entryData.date);

        // Map frontend fields to backend fields
        const project = entryData.project;
        const isBillable = entryData.isBillable !== undefined ? entryData.isBillable : true;

        // Check if entry already exists
        const existing = await TimesheetEntry.findOne({
          tenantId: req.user?.tenantId,
          userId: req.user?.userId,
          date: entryData.date,
          project
        });

        if (!existing && entryData.hours > 0) {
          const entry = new TimesheetEntry({
            tenantId: req.user?.tenantId,
            userId: req.user?.userId,
            date: entryData.date,
            weekStartDate: weekStart,
            weekEndDate: weekEnd,
            year,
            weekNumber,
            project,
            task: entryData.task || entryData.description || '',
            description: entryData.description || '',
            hours: entryData.hours,
            isBillable,
            status: TimesheetStatus.DRAFT
          });
          await entry.save();
          createdEntries.push(entry);
        }
      }

      if (errors.length > 0 && createdEntries.length === 0) {
        return ApiResponse.validationError(res, errors);
      }

      return ApiResponse.created(res, createdEntries, `${createdEntries.length} entries created successfully`);
    } catch (error) {
      console.error('Batch create error:', error);
      return ApiResponse.error(res, 'Failed to create timesheet entries', 500);
    }
  }

  /**
   * Get entries for a week
   */
  static async getWeekEntries(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { weekStartDate } = req.params;

      // Validate tenant context
      if (!RequestValidator.validateTenantContext(req, res)) return;

      // Use BusinessLogic utility to get week dates
      const { weekStart, weekEnd } = BusinessLogic.getWeekDates(weekStartDate);

      const entries = await TimesheetEntry.find({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        date: { $gte: weekStart, $lte: weekEnd }
      }).sort({ date: 1 });

      // Determine week status based on entries
      let weekStatus = TimesheetStatus.DRAFT;
      if (entries.length > 0) {
        // Check if all entries have the same status
        const statuses = [...new Set(entries.map(e => e.status))];
        if (statuses.length === 1) {
          weekStatus = statuses[0];
        } else if (statuses.includes(TimesheetStatus.SUBMITTED)) {
          weekStatus = TimesheetStatus.SUBMITTED;
        } else if (statuses.includes(TimesheetStatus.REJECTED)) {
          weekStatus = TimesheetStatus.REJECTED;
        }
      }

      // Calculate summary using utility
      const hoursSummary = BusinessLogic.calculateWeekTotalHours(entries);

      const responseData = toWeeklyTimesheetResponse(
        entries,
        weekStart,
        weekEnd,
        weekStatus,
        hoursSummary.total,
        hoursSummary.billable,
        hoursSummary.nonBillable
      );
      return ApiResponse.success(res, responseData, 'Week entries retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve timesheet entries');
    }
  }

  /**
   * Update timesheet entry (only Draft or Rejected)
   */
  static async updateEntry(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { entryId } = req.params;
      const { project, task, description, hours, isBillable }: IUpdateTimesheetEntryRequest = req.body;

      // Validate tenant context
      if (!RequestValidator.validateTenantContext(req, res)) return;

      // Validate ObjectId
      const idValidation = RequestValidator.validateObjectId(entryId, 'Entry ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      // Validate hours if provided
      if (hours !== undefined) {
        const hoursValidation = BusinessLogic.validateTimesheetHours(hours);
        if (!hoursValidation.valid) {
          return ApiResponse.validationError(res, [hoursValidation.error!]);
        }
      }

      const entry = await TimesheetEntry.findOne({
        _id: entryId,
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      });

      if (!entry) {
        return ApiResponse.notFound(res, 'Timesheet entry not found');
      }

      // Can only edit Draft or Rejected entries
      if (entry.status !== TimesheetStatus.DRAFT && entry.status !== TimesheetStatus.REJECTED) {
        return ApiResponse.forbidden(res, 'Cannot edit submitted or approved entries');
      }

      if (project) entry.project = project;
      if (task) entry.task = task;
      if (description) entry.description = description;
      if (hours) entry.hours = hours;
      if (isBillable !== undefined) entry.isBillable = isBillable;

      await entry.save();

      const responseData = toTimesheetEntryResponse(entry);
      return ApiResponse.success(res, responseData, 'Timesheet entry updated successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to update timesheet entry');
    }
  }

  /**
   * Delete timesheet entry (only Draft or Rejected)
   */
  static async deleteEntry(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { entryId } = req.params;

      const entry = await TimesheetEntry.findOne({
        _id: entryId,
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      });

      if (!entry) {
        return ApiResponse.notFound(res, 'Timesheet entry not found');
        return;
      }

      // Can only delete Draft or Rejected entries
      if (entry.status !== TimesheetStatus.DRAFT && entry.status !== TimesheetStatus.REJECTED) {
        return ApiResponse.forbidden(res, 'Cannot delete submitted or approved entries');
        return;
      }

      await entry.deleteOne();

      return ApiResponse.success(res, null, 'Timesheet entry deleted successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to delete timesheet entry');
    }
  }

  /**
   * Submit week for approval
   */
  static async submitWeek(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { weekStart, weekStartDate }: ISubmitWeekRequest = req.body;

      // Support both weekStart and weekStartDate for backward compatibility
      const dateToUse = weekStart || weekStartDate;
      if (!dateToUse) {
        return ApiResponse.error(res, 'Week start date is required');
      }

      // Use isoWeek to treat Monday as start of week
      const startDate = dayjs(dateToUse).startOf('isoWeek').toDate();
      const endDate = dayjs(dateToUse).endOf('isoWeek').toDate();

      // Find all draft entries for the week
      const entries = await TimesheetEntry.find({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        date: { $gte: startDate, $lte: endDate },
        status: TimesheetStatus.DRAFT
      });

      if (entries.length === 0) {
        return ApiResponse.error(res, 'No draft entries found for this week');
      }

      // Update all entries to submitted
      const updatePromises = entries.map(entry => {
        entry.status = TimesheetStatus.SUBMITTED;
        entry.submittedAt = new Date();
        entry.submittedBy = req.user?.userId;
        return entry.save();
      });

      await Promise.all(updatePromises);

      return ApiResponse.success(res, { count: entries.length }, `${entries.length} entries submitted for approval`);
    } catch (error) {
      console.error('Submit week error:', error);
      return ApiResponse.error(res, 'Failed to submit timesheet');
    }
  }

  /**
   * Get pending approvals (Supervisor/HR/Admin/Employer)
   */
  static async getPendingApprovals(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const query: any = {
        tenantId: req.user?.tenantId,
        status: TimesheetStatus.SUBMITTED
      };

      // Supervisors see only their team's submissions
      if (req.user?.role === 'supervisor') {
        const teamMembers = await User.find({
          tenantId: req.user.tenantId,
          reportingTo: req.user.userId
        }).select('_id');

        query.userId = { $in: teamMembers.map(u => u._id) };
      }

      const entries = await TimesheetEntry.find(query)
        .populate('userId', 'firstName lastName email employeeId')
        .sort({ weekStartDate: -1, date: 1 });

      // Group by user and week
      interface GroupedEntry {
        userId: string | { _id: string };
        weekStartDate: Date;
        weekEndDate: Date;
        entries: (Document & ITimesheetEntry)[];
        totalHours: number;
      }

      const groupedEntries = entries.reduce((acc: Record<string, GroupedEntry>, entry) => {
        const userId = typeof entry.userId === 'object' ? String((entry.userId as { _id: string })._id) : entry.userId;
        const key = `${userId}-${entry.weekStartDate}`;
        if (!acc[key]) {
          acc[key] = {
            userId: entry.userId,
            weekStartDate: entry.weekStartDate,
            weekEndDate: entry.weekEndDate,
            entries: [],
            totalHours: 0
          };
        }
        acc[key].entries.push(entry);
        acc[key].totalHours += entry.hours;
        return acc;
      }, {});

      const responseData = toPendingTimesheetGroupResponse(groupedEntries);
      return ApiResponse.success(res, responseData, 'Pending approvals retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve pending approvals');
    }
  }

  /**
   * Approve timesheet entries
   */
  static async approveEntries(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { entryIds, comments }: IApproveTimesheetEntriesRequest = req.body;

      // Validate required fields
      if (!RequestValidator.validateRequiredFields(req.body, ['entryIds'], res)) return;

      if (!Array.isArray(entryIds) || entryIds.length === 0) {
        return ApiResponse.validationError(res, ['Entry IDs array is required and must not be empty']);
      }

      const entries = await TimesheetEntry.find({
        _id: { $in: entryIds },
        tenantId: req.user?.tenantId,
        status: TimesheetStatus.SUBMITTED
      });

      if (entries.length === 0) {
        return ApiResponse.notFound(res, 'No submitted entries found');
      }

      // Update all entries to approved
      const updatePromises = entries.map(entry => {
        entry.status = TimesheetStatus.APPROVED;
        entry.approvedBy = req.user?.userId;
        entry.approvedAt = new Date();
        if (comments) entry.approvalComments = comments;
        return entry.save();
      });

      await Promise.all(updatePromises);

      // Send notifications (group by user and week)
      const approver = await User.findById(req.user?.userId);
      if (approver && entries.length > 0) {
        const uniqueUserWeeks = new Map<string, {userId: string; weekStart: Date; weekEnd: Date}>();
        entries.forEach(entry => {
          const key = `${entry.userId}-${entry.weekStartDate}`;
          if (!uniqueUserWeeks.has(key)) {
            uniqueUserWeeks.set(key, {
              userId: String(entry.userId),
              weekStart: entry.weekStartDate,
              weekEnd: entry.weekEndDate
            });
          }
        });

        for (const {userId, weekStart, weekEnd} of uniqueUserWeeks.values()) {
          await NotificationService.notifyTimesheetApproved(
            req.user!.tenantId,
            userId,
            DateUtil.formatDate(weekStart),
            DateUtil.formatDate(weekEnd),
            approver.fullName
          );
        }
      }

      const responseData: ITimesheetApprovalActionResponse = {
        count: entries.length
      };

      return ApiResponse.success<ITimesheetApprovalActionResponse>(res, responseData, `${entries.length} entries approved`);
    } catch (error) {
      console.error('Approve entries error:', error);
      return ApiResponse.error(res, 'Failed to approve entries', 500);
    }
  }

  /**
   * Reject timesheet entries
   */
  static async rejectEntries(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { entryIds, comments }: IRejectTimesheetEntriesRequest = req.body;

      // Validate required fields
      if (!RequestValidator.validateRequiredFields(req.body, ['entryIds', 'comments'], res)) return;

      if (!Array.isArray(entryIds) || entryIds.length === 0) {
        return ApiResponse.validationError(res, ['Entry IDs array is required and must not be empty']);
      }

      const entries = await TimesheetEntry.find({
        _id: { $in: entryIds },
        tenantId: req.user?.tenantId,
        status: TimesheetStatus.SUBMITTED
      });

      if (entries.length === 0) {
        return ApiResponse.notFound(res, 'No submitted entries found');
      }

      // Update all entries to rejected
      const updatePromises = entries.map(entry => {
        entry.status = TimesheetStatus.REJECTED;
        entry.rejectedBy = req.user?.userId;
        entry.rejectedAt = new Date();
        entry.approvalComments = comments;
        return entry.save();
      });

      await Promise.all(updatePromises);

      // Send notifications (group by user and week)
      const approver = await User.findById(req.user?.userId);
      if (approver && entries.length > 0) {
        const uniqueUserWeeks = new Map<string, {userId: string; weekStart: Date; weekEnd: Date}>();
        entries.forEach(entry => {
          const key = `${entry.userId}-${entry.weekStartDate}`;
          if (!uniqueUserWeeks.has(key)) {
            uniqueUserWeeks.set(key, {
              userId: String(entry.userId),
              weekStart: entry.weekStartDate,
              weekEnd: entry.weekEndDate
            });
          }
        });

        for (const {userId, weekStart, weekEnd} of uniqueUserWeeks.values()) {
          await NotificationService.notifyTimesheetRejected(
            req.user!.tenantId,
            userId,
            DateUtil.formatDate(weekStart),
            DateUtil.formatDate(weekEnd),
            approver.fullName,
            comments
          );
        }
      }

      const responseData: ITimesheetApprovalActionResponse = {
        count: entries.length
      };

      return ApiResponse.success<ITimesheetApprovalActionResponse>(res, responseData, `${entries.length} entries rejected`);
    } catch (error) {
      console.error('Reject entries error:', error);
      return ApiResponse.error(res, 'Failed to reject entries', 500);
    }
  }

  /**
   * Get timesheet history
   */
  static async getHistory(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { startDate, endDate, status } = req.query as any;

      const query: any = {
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      };

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      if (status) {
        query.status = status;
      }

      const entries = await TimesheetEntry.find(query)
        .populate('approvedBy', 'firstName lastName')
        .populate('rejectedBy', 'firstName lastName')
        .sort({ date: -1 });

      return ApiResponse.success(res, entries, 'Timesheet history retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve timesheet history');
    }
  }
}


