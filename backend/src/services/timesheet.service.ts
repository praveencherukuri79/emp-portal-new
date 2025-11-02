import { Model } from 'mongoose';
import { ITimesheetEntry } from '../types';
import { BaseService } from './base.service';
import { QueryBuilder } from '../utils/query-builder.util';

export class TimesheetService extends BaseService<ITimesheetEntry> {
  constructor(model: Model<ITimesheetEntry>) {
    super(model);
  }

  /**
   * Get timesheet entries for a specific date range
   */
  async getEntriesByDateRange(
    tenantId: string,
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    const query = new QueryBuilder<ITimesheetEntry>(this.model)
      .withTenant(tenantId)
      .withUser(userId)
      .withDateRange('date', { startDate, endDate })
      .sortBy('-date');

    return query.executeAll();
  }

  /**
   * Get timesheet entries by status
   */
  async getEntriesByStatus(
    tenantId: string,
    userId: string,
    status: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query = new QueryBuilder<ITimesheetEntry>(this.model)
      .withTenant(tenantId)
      .withUser(userId)
      .withStatus(status)
      .paginate(page, limit)
      .sortBy('-date');

    return query.execute();
  }

  /**
   * Calculate total hours for a user in a date range
   */
  async calculateTotalHours(
    tenantId: string,
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const entries = await this.getEntriesByDateRange(
      tenantId,
      userId,
      startDate,
      endDate
    );

    return entries.reduce((total, entry) => total + (entry.hours || 0), 0);
  }

  /**
   * Get timesheet summary by project
   */
  async getProjectSummary(
    tenantId: string,
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    const entries = await this.getEntriesByDateRange(
      tenantId,
      userId,
      startDate,
      endDate
    );

    const projectMap = new Map<string, { hours: number; entries: number }>();

    entries.forEach(entry => {
      const projectId = entry.project?.toString() || 'No Project';
      const current = projectMap.get(projectId) || { hours: 0, entries: 0 };
      current.hours += entry.hours || 0;
      current.entries += 1;
      projectMap.set(projectId, current);
    });

    return Array.from(projectMap.entries()).map(([projectId, data]) => ({
      projectId,
      totalHours: data.hours,
      totalEntries: data.entries,
    }));
  }

  /**
   * Submit timesheet entries (change status to submitted)
   */
  async submitEntries(
    tenantId: string,
    userId: string,
    entryIds: string[]
  ) {
    // First verify entries belong to user
    const entries = await this.model.find({
      _id: { $in: entryIds },
      tenantId,
      userId
    });

    if (entries.length !== entryIds.length) {
      throw new Error('Some entries not found or unauthorized');
    }

    const results = await this.bulkUpdate(
      entryIds,
      { status: 'submitted', submittedAt: new Date() } as any,
      tenantId
    );

    return results;
  }

  /**
   * Approve or reject timesheet entries
   */
  async updateEntryStatus(
    tenantId: string,
    entryIds: string[],
    status: 'approved' | 'rejected',
    reviewedBy: string,
    comments?: string
  ) {
    const updateData: any = {
      status,
      reviewedBy,
      reviewedAt: new Date(),
    };

    if (comments) {
      updateData.reviewComments = comments;
    }

    const results = await this.bulkUpdate(
      entryIds,
      updateData,
      tenantId
    );

    return results;
  }
}
