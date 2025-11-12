import { Response } from 'express';
import { TimesheetEntry, User } from '../models';
import { ApiResponse } from '@utils/response.util';
import { IAuthRequest, TimesheetStatus, ITimesheetEntryDTO, ITimesheetEntry } from '../types';
import { IBatchTimesheetEntriesRequest, IUpdateTimesheetEntryRequest, ISubmitWeekRequest, IApproveTimesheetEntriesRequest, IRejectTimesheetEntriesRequest } from '@shared/types/requests';
import { ITimesheetApprovalActionResponse } from '@shared/types/responses';
import { toTimesheetEntryResponse, toWeeklyTimesheetResponse, toPendingTimesheetGroupResponse } from '../dto';
import { Document } from 'mongoose';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export class TimesheetController {
  /**
   * Create timesheet entry
   */
  static async createEntry(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { date, project, task, description, hours, isBillable }: ITimesheetEntryDTO = req.body;

      // Calculate week information
      const entryDate = dayjs(date);
      const weekStart = entryDate.startOf('isoWeek');
      const weekEnd = entryDate.endOf('isoWeek');

      // Check if entry already exists for this date and project
      const existingEntry = await TimesheetEntry.findOne({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        date,
        project
      });

      if (existingEntry) {
        return ApiResponse.error(res, 'Entry already exists for this date and project');
        return;
      }

      const entry = new TimesheetEntry({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        date,
        weekStartDate: weekStart.toDate(),
        weekEndDate: weekEnd.toDate(),
        year: entryDate.year(),
        weekNumber: entryDate.isoWeek(),
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
      return ApiResponse.error(res, 'Failed to create timesheet entry');
    }
  }

  /**
   * Batch create entries (Quick Entry feature)
   */
  static async batchCreateEntries(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { entries }: IBatchTimesheetEntriesRequest = req.body;

      if (!Array.isArray(entries) || entries.length === 0) {
        return ApiResponse.error(res, 'Entries array is required');
        return;
      }

      const createdEntries = [];
      
      for (const entryData of entries) {
        // Calculate week information for each entry
        const entryDate = dayjs(entryData.date);
        const weekStart = entryDate.startOf('isoWeek');
        const weekEnd = entryDate.endOf('isoWeek');

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
            weekStartDate: weekStart.toDate(),
            weekEndDate: weekEnd.toDate(),
            year: entryDate.year(),
            weekNumber: entryDate.isoWeek(),
            project,
            task: entryData.description || '',
            description: entryData.description || '',
            hours: entryData.hours,
            isBillable,
            status: TimesheetStatus.DRAFT // Always create as DRAFT
          });
          await entry.save();
          createdEntries.push(entry);
        }
      }

      return ApiResponse.created(res, createdEntries, `${createdEntries.length} entries created successfully`);
    } catch (error) {
      console.error('Batch create error:', error);
      return ApiResponse.error(res, 'Failed to create timesheet entries');
    }
  }

  /**
   * Get entries for a week
   */
  static async getWeekEntries(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { weekStartDate } = req.params;

      // Use isoWeek to treat Monday as start of week (not Sunday)
      const startDate = dayjs(weekStartDate).startOf('isoWeek').toDate();
      const endDate = dayjs(weekStartDate).endOf('isoWeek').toDate();

      const entries = await TimesheetEntry.find({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        date: { $gte: startDate, $lte: endDate }
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

      // Calculate summary
      const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
      const billableHours = entries.reduce((sum, entry) => entry.isBillable ? sum + entry.hours : sum, 0);
      const nonBillableHours = totalHours - billableHours;

      const responseData = toWeeklyTimesheetResponse(
        entries,
        startDate,
        endDate,
        weekStatus,
        totalHours,
        billableHours,
        nonBillableHours
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

      const entry = await TimesheetEntry.findOne({
        _id: entryId,
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      });

      if (!entry) {
        return ApiResponse.notFound(res, 'Timesheet entry not found');
        return;
      }

      // Can only edit Draft or Rejected entries
      if (entry.status !== TimesheetStatus.DRAFT && entry.status !== TimesheetStatus.REJECTED) {
        return ApiResponse.forbidden(res, 'Cannot edit submitted or approved entries');
        return;
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

      const entries = await TimesheetEntry.find({
        _id: { $in: entryIds },
        tenantId: req.user?.tenantId,
        status: TimesheetStatus.SUBMITTED
      });

      if (entries.length === 0) {
        return ApiResponse.notFound(res, 'No submitted entries found');
        return;
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

      const responseData: ITimesheetApprovalActionResponse = {
        count: entries.length
      };

      return ApiResponse.success<ITimesheetApprovalActionResponse>(res, responseData, `${entries.length} entries approved`);
    } catch (error) {
      return ApiResponse.error(res, 'Failed to approve entries');
    }
  }

  /**
   * Reject timesheet entries
   */
  static async rejectEntries(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { entryIds, comments }: IRejectTimesheetEntriesRequest = req.body;

      if (!comments) {
        return ApiResponse.error(res, 'Rejection comments are required');
        return;
      }

      const entries = await TimesheetEntry.find({
        _id: { $in: entryIds },
        tenantId: req.user?.tenantId,
        status: TimesheetStatus.SUBMITTED
      });

      if (entries.length === 0) {
        return ApiResponse.notFound(res, 'No submitted entries found');
        return;
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

      const responseData: ITimesheetApprovalActionResponse = {
        count: entries.length
      };

      return ApiResponse.success<ITimesheetApprovalActionResponse>(res, responseData, `${entries.length} entries rejected`);
    } catch (error) {
      return ApiResponse.error(res, 'Failed to reject entries');
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


