import { Response } from 'express';
import { TimesheetEntry, User } from '../models';
import { ApiResponse } from '@utils/response.util';
import { IAuthRequest, TimesheetStatus } from '../types';
import moment from 'moment';

export class TimesheetController {
  /**
   * Create timesheet entry
   */
  static async createEntry(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { date, project, task, description, hours, isBillable } = req.body;

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
        project,
        task,
        description,
        hours,
        isBillable: isBillable ?? true,
        status: TimesheetStatus.DRAFT
      });

      await entry.save();

      return ApiResponse.created(res, entry, 'Timesheet entry created successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to create timesheet entry');
    }
  }

  /**
   * Batch create entries (Quick Entry feature)
   */
  static async batchCreateEntries(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { entries } = req.body; // Array of entries with same project

      if (!Array.isArray(entries) || entries.length === 0) {
        return ApiResponse.error(res, 'Entries array is required');
        return;
      }

      const createdEntries = [];
      
      for (const entryData of entries) {
        // Check if entry already exists
        const existing = await TimesheetEntry.findOne({
          tenantId: req.user?.tenantId,
          userId: req.user?.userId,
          date: entryData.date,
          project: entryData.project
        });

        if (!existing) {
          const entry = new TimesheetEntry({
            ...entryData,
            tenantId: req.user?.tenantId,
            userId: req.user?.userId,
            status: TimesheetStatus.DRAFT
          });
          await entry.save();
          createdEntries.push(entry);
        }
      }

      return ApiResponse.created(res, createdEntries, `${createdEntries.length} entries created successfully`);
    } catch (error) {
      return ApiResponse.error(res, 'Failed to create timesheet entries');
    }
  }

  /**
   * Get entries for a week
   */
  static async getWeekEntries(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { weekStartDate } = req.params;

      const startDate = moment(weekStartDate).startOf('week').toDate();
      const endDate = moment(weekStartDate).endOf('week').toDate();

      const entries = await TimesheetEntry.find({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      // Calculate summary
      const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
      const billableHours = entries.reduce((sum, entry) => entry.isBillable ? sum + entry.hours : sum, 0);
      const nonBillableHours = totalHours - billableHours;

      return ApiResponse.success(res, {
        entries, summary: {
          totalHours,
          billableHours,
          nonBillableHours,
          entriesCount: entries.length
        }
      }, 'Week entries retrieved successfully');
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
      const { project, task, description, hours, isBillable } = req.body;

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

      return ApiResponse.success(res, entry, 'Timesheet entry updated successfully');
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
      const { weekStartDate } = req.body;

      const startDate = moment(weekStartDate).startOf('week').toDate();
      const endDate = moment(weekStartDate).endOf('week').toDate();

      // Find all draft entries for the week
      const entries = await TimesheetEntry.find({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        date: { $gte: startDate, $lte: endDate },
        status: TimesheetStatus.DRAFT
      });

      if (entries.length === 0) {
        return ApiResponse.error(res, 'No draft entries found for this week');
        return;
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
      const groupedEntries = entries.reduce((acc: any, entry) => {
        const userId = typeof entry.userId === 'object' ? (entry.userId as any)._id : entry.userId;
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

      return ApiResponse.success(res, Object.values(groupedEntries), 'Pending approvals retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve pending approvals');
    }
  }

  /**
   * Approve timesheet entries
   */
  static async approveEntries(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { entryIds, comments } = req.body;

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

      return ApiResponse.success(res, { count: entries.length }, `${entries.length} entries approved`);
    } catch (error) {
      return ApiResponse.error(res, 'Failed to approve entries');
    }
  }

  /**
   * Reject timesheet entries
   */
  static async rejectEntries(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { entryIds, comments } = req.body;

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

      return ApiResponse.success(res, { count: entries.length }, `${entries.length} entries rejected`);
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


