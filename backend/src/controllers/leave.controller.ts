import { Response } from 'express';
import { LeaveRequest, User } from '../models';
import { ApiResponse } from '@utils/response.util';
import { IAuthRequest, LeaveStatus, LeaveType, UserRole, ILeaveRequestDTO } from '../types';
import { IUpdateLeaveRequestRequest, ICancelLeaveRequest, IApproveLeaveRequest, IRejectLeaveRequest } from '@shared/types/requests';
import { toLeaveRequestResponse, toLeaveRequestResponseArray } from '../dto';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);

export class LeaveController {
  /**
   * Create leave request
   */
  static async createLeaveRequest(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { leaveType, startDate, endDate, isHalfDay, halfDayPeriod, reason }: ILeaveRequestDTO = req.body;

      // Validate dates
      if (new Date(startDate) > new Date(endDate)) {
        return ApiResponse.error(res, 'End date must be after start date', 400);
        return;
      }

      // Calculate total days
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      let totalDays = 0;
      
      let current = start;
      while (current.isSameOrBefore(end, 'day')) {
        const dayOfWeek = current.day();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
          totalDays++;
        }
        current = current.add(1, 'day');
      }
      
      // Adjust for half-day
      if (isHalfDay) {
        totalDays = 0.5;
      }

      // Check leave balance
      const user = await User.findById(req.user?.userId);
      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
        return;
      }

      const leaveRequest = new LeaveRequest({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        isHalfDay: isHalfDay ?? false,
        halfDayPeriod,
        reason,
        status: LeaveStatus.PENDING
      });

      await leaveRequest.save();

      const responseData = toLeaveRequestResponse(leaveRequest);
      return ApiResponse.created(res, responseData, 'Leave request submitted successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to create leave request', 500);
    }
  }

  /**
   * Get my leave requests
   */
  static async getMyLeaveRequests(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { status, startDate, endDate } = req.query as any;

      const query: any = {
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      };

      if (status) query.status = status;
      if (startDate && endDate) {
        query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      const leaveRequests = await LeaveRequest.find(query)
        .populate('approvedBy', 'firstName lastName')
        .populate('rejectedBy', 'firstName lastName')
        .sort({ createdAt: -1 });

      const responseData = toLeaveRequestResponseArray(leaveRequests);
      return ApiResponse.success(res, responseData, 'Leave requests retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve leave requests', 500);
    }
  }

  /**
   * Get leave balance for current user
   */
  static async getMyLeaveBalance(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const user = await User.findById(req.user?.userId).select('leaveBalance');
      
      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
        return;
      }

      // Calculate used leaves for current year
      const yearStart = dayjs().startOf('year').toDate();
      const yearEnd = dayjs().endOf('year').toDate();

      const leaveRequests = await LeaveRequest.find({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        status: LeaveStatus.APPROVED,
        startDate: { $gte: yearStart, $lte: yearEnd }
      });

      const usedLeaves: Record<string, number> = {
        annual: 0,
        sick: 0,
        personal: 0,
        unpaid: 0,
        maternity: 0,
        paternity: 0
      };

      leaveRequests.forEach(leave => {
        usedLeaves[leave.leaveType] += leave.totalDays;
      });

      const balance = {
        annual: {
          total: user.leaveBalance.annual,
          used: usedLeaves.annual,
          remaining: user.leaveBalance.annual - usedLeaves.annual
        },
        sick: {
          total: user.leaveBalance.sick,
          used: usedLeaves.sick,
          remaining: user.leaveBalance.sick - usedLeaves.sick
        },
        personal: {
          total: user.leaveBalance.personal,
          used: usedLeaves.personal,
          remaining: user.leaveBalance.personal - usedLeaves.personal
        },
        unpaid: {
          total: user.leaveBalance.unpaid,
          used: usedLeaves.unpaid,
          remaining: user.leaveBalance.unpaid - usedLeaves.unpaid
        },
        maternity: {
          total: user.leaveBalance.maternity,
          used: usedLeaves.maternity,
          remaining: user.leaveBalance.maternity - usedLeaves.maternity
        },
        paternity: {
          total: user.leaveBalance.paternity,
          used: usedLeaves.paternity,
          remaining: user.leaveBalance.paternity - usedLeaves.paternity
        }
      };

      return ApiResponse.success(res, balance, 'Leave balance retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve leave balance', 500);
    }
  }

  /**
   * Get leave calendar (all approved leaves)
   */
  static async getLeaveCalendar(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { startDate, endDate } = req.query as any;

      const query: any = {
        tenantId: req.user?.tenantId,
        status: LeaveStatus.APPROVED
      };

      if (startDate && endDate) {
        query.$or = [
          { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } }
        ];
      }

      const leaves = await LeaveRequest.find(query)
        .populate('userId', 'firstName lastName employeeId')
        .sort({ startDate: 1 });

      return ApiResponse.success(res, leaves, 'Leave calendar retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve leave calendar', 500);
    }
  }

  /**
   * Update leave request (only pending)
   */
  static async updateLeaveRequest(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { leaveId } = req.params;
      const { leaveType, startDate, endDate, isHalfDay, halfDayPeriod, reason }: IUpdateLeaveRequestRequest = req.body;

      const leave = await LeaveRequest.findOne({
        _id: leaveId,
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      });

      if (!leave) {
        return ApiResponse.notFound(res, 'Leave request not found');
        return;
      }

      if (leave.status !== LeaveStatus.PENDING) {
        return ApiResponse.forbidden(res, 'Cannot update approved/rejected leave requests');
        return;
      }

      if (leaveType) leave.leaveType = leaveType;
      if (startDate) leave.startDate = new Date(startDate);
      if (endDate) leave.endDate = new Date(endDate);
      if (isHalfDay !== undefined) leave.isHalfDay = isHalfDay;
      if (halfDayPeriod) leave.halfDayPeriod = halfDayPeriod;
      if (reason) leave.reason = reason;

      await leave.save();

      return ApiResponse.success(res, leave, 'Leave request updated successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to update leave request', 500);
    }
  }

  /**
   * Cancel leave request
   */
  static async cancelLeaveRequest(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { leaveId } = req.params;
      const { cancellationReason }: ICancelLeaveRequest = req.body;

      const leave = await LeaveRequest.findOne({
        _id: leaveId,
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      });

      if (!leave) {
        return ApiResponse.notFound(res, 'Leave request not found');
        return;
      }

      if (leave.status === LeaveStatus.CANCELLED) {
        return ApiResponse.error(res, 'Leave request already cancelled', 400);
        return;
      }

      leave.status = LeaveStatus.CANCELLED;
      leave.cancelledAt = new Date();
      leave.cancellationReason = cancellationReason;

      await leave.save();

      return ApiResponse.success(res, leave, 'Leave request cancelled successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to cancel leave request', 500);
    }
  }

  /**
   * Get pending leave approvals (Supervisor/HR/Admin/Employer)
   */
  static async getPendingApprovals(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const query: any = {
        tenantId: req.user?.tenantId,
        status: LeaveStatus.PENDING
      };

      // Supervisors see only their team's requests
      if (req.user?.role === UserRole.SUPERVISOR) {
        const teamMembers = await User.find({
          tenantId: req.user.tenantId,
          reportingTo: req.user.userId
        }).select('_id');

        query.userId = { $in: teamMembers.map(u => u._id) };
      }

      const leaveRequests = await LeaveRequest.find(query)
        .populate('userId', 'firstName lastName email employeeId leaveBalance')
        .sort({ createdAt: 1 });

      return ApiResponse.success(res, leaveRequests, 'Pending leave approvals retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve pending approvals', 500);
    }
  }

  /**
   * Approve leave request
   */
  static async approveLeaveRequest(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { leaveId } = req.params;
      const { comments }: IApproveLeaveRequest = req.body;

      const leave = await LeaveRequest.findOne({
        _id: leaveId,
        tenantId: req.user?.tenantId,
        status: LeaveStatus.PENDING
      });

      if (!leave) {
        return ApiResponse.notFound(res, 'Leave request not found');
        return;
      }

      leave.status = LeaveStatus.APPROVED;
      leave.approvedBy = req.user?.userId;
      leave.approvedAt = new Date();
      if (comments) leave.approvalComments = comments;

      await leave.save();

      return ApiResponse.success(res, leave, 'Leave request approved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to approve leave request', 500);
    }
  }

  /**
   * Reject leave request
   */
  static async rejectLeaveRequest(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { leaveId } = req.params;
      const { comments }: IRejectLeaveRequest = req.body;

      if (!comments) {
        return ApiResponse.error(res, 'Rejection comments are required', 400);
        return;
      }

      const leave = await LeaveRequest.findOne({
        _id: leaveId,
        tenantId: req.user?.tenantId,
        status: LeaveStatus.PENDING
      });

      if (!leave) {
        return ApiResponse.notFound(res, 'Leave request not found');
        return;
      }

      leave.status = LeaveStatus.REJECTED;
      leave.rejectedBy = req.user?.userId;
      leave.rejectedAt = new Date();
      leave.approvalComments = comments;

      await leave.save();

      return ApiResponse.success(res, leave, 'Leave request rejected successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to reject leave request', 500);
    }
  }

  /**
   * Get leave statistics (HR/Admin/Employer)
   */
  static async getLeaveStatistics(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const yearStart = dayjs().startOf('year').toDate();
      const yearEnd = dayjs().endOf('year').toDate();

      const leaves = await LeaveRequest.find({
        tenantId: req.user?.tenantId,
        status: LeaveStatus.APPROVED,
        startDate: { $gte: yearStart, $lte: yearEnd }
      });

      const stats = {
        totalLeaves: leaves.length,
        totalDays: leaves.reduce((sum: number, leave: any) => sum + leave.totalDays, 0),
        byType: {
          annual: leaves.filter(l => l.leaveType === LeaveType.ANNUAL).length,
          sick: leaves.filter(l => l.leaveType === LeaveType.SICK).length,
          personal: leaves.filter(l => l.leaveType === LeaveType.PERSONAL).length,
          unpaid: leaves.filter(l => l.leaveType === LeaveType.UNPAID).length,
          maternity: leaves.filter(l => l.leaveType === LeaveType.MATERNITY).length,
          paternity: leaves.filter(l => l.leaveType === LeaveType.PATERNITY).length
        },
        pending: await LeaveRequest.countDocuments({
          tenantId: req.user?.tenantId,
          status: LeaveStatus.PENDING
        })
      };

      return ApiResponse.success(res, stats, 'Leave statistics retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve leave statistics', 500);
    }
  }
}




