import { Model } from 'mongoose';
import { ILeaveRequest } from '../types';
import { BaseService } from './base.service';
import { QueryBuilder } from '../utils/query-builder.util';

export class LeaveService extends BaseService<ILeaveRequest> {
  constructor(model: Model<ILeaveRequest>) {
    super(model);
  }

  /**
   * Get leave requests by status
   */
  async getLeavesByStatus(
    tenantId: string,
    status: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query = new QueryBuilder<ILeaveRequest>(this.model)
      .withTenant(tenantId)
      .withStatus(status)
      .paginate(page, limit)
      .sortBy('-createdAt')
      .populate('userId');

    return query.execute();
  }

  /**
   * Get user's leave requests
   */
  async getUserLeaves(
    tenantId: string,
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query = new QueryBuilder<ILeaveRequest>(this.model)
      .withTenant(tenantId)
      .withUser(userId)
      .paginate(page, limit)
      .sortBy('-startDate');

    if (status) {
      query.withStatus(status);
    }

    return query.execute();
  }

  /**
   * Get leaves in a date range
   */
  async getLeavesByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    userId?: string
  ) {
    const query = new QueryBuilder<ILeaveRequest>(this.model)
      .withTenant(tenantId)
      .withDateRange('startDate', { startDate, endDate })
      .sortBy('-startDate');

    if (userId) {
      query.withUser(userId);
    }

    return query.executeAll();
  }

  /**
   * Calculate total leave days for a user in a year
   */
  async calculateLeaveDays(
    tenantId: string,
    userId: string,
    year: number,
    status: 'approved' | 'pending' | 'rejected' = 'approved'
  ): Promise<number> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const leaves = await this.model.find({
      tenantId,
      userId,
      status,
      startDate: { $gte: startDate, $lte: endDate },
    });

    return leaves.reduce((total, leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
  }

  /**
   * Get leave balance for a user
   */
  async getLeaveBalance(
    tenantId: string,
    userId: string,
    year: number = new Date().getFullYear()
  ) {
    const approvedDays = await this.calculateLeaveDays(tenantId, userId, year, 'approved');
    const pendingDays = await this.calculateLeaveDays(tenantId, userId, year, 'pending');

    // Assuming 20 days annual leave (this should come from company policy)
    const annualLeave = 20;

    return {
      totalAllowed: annualLeave,
      used: approvedDays,
      pending: pendingDays,
      available: annualLeave - approvedDays - pendingDays,
    };
  }

  /**
   * Check for overlapping leaves
   */
  async checkOverlap(
    tenantId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<boolean> {
    const filter: any = {
      tenantId,
      userId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const count = await this.model.countDocuments(filter);
    return count > 0;
  }

  /**
   * Approve or reject leave request
   */
  async updateLeaveStatus(
    tenantId: string,
    leaveId: string,
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

    return this.updateById(leaveId, updateData, { tenantId });
  }

  /**
   * Cancel leave request (by user)
   */
  async cancelLeave(
    tenantId: string,
    leaveId: string,
    userId: string
  ) {
    const leave = await this.findById(leaveId, tenantId);
    
    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.userId.toString() !== userId) {
      throw new Error('Unauthorized to cancel this leave');
    }

    if (leave.status === 'approved' || leave.status === 'rejected') {
      throw new Error('Cannot cancel approved or rejected leave');
    }

    return this.updateById(leaveId, {
      status: 'cancelled',
      cancelledAt: new Date(),
    } as any, { tenantId });
  }
}
