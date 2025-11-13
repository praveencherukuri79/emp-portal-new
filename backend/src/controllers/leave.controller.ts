import { Response } from 'express';
import { LeaveRequest, User } from '../models';
import { ApiResponse, RequestValidator, BusinessLogic, DateUtil } from '../utils';
import { IAuthRequest, LeaveStatus, LeaveType, UserRole, ILeaveRequestDTO } from '../types';
import { IUpdateLeaveRequestRequest, ICancelLeaveRequest, IApproveLeaveRequest, IRejectLeaveRequest } from '@shared/types/requests';
import { toLeaveRequestResponse, toLeaveRequestResponseArray } from '../dto';
import { PermissionChecker, userHasPermission } from '../utils/permission.util';
import { Permission } from '@shared/types/permissions';
import NotificationService from '../services/notification.service';
import { formatLeaveType } from '@shared/utils/formatters';
import dayjs from 'dayjs';

export class LeaveController {
  /**
   * Create leave request
   */
  static async createLeaveRequest(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { leaveType, startDate, endDate, isHalfDay, halfDayPeriod, reason }: ILeaveRequestDTO = req.body;

      // Validate tenant context
      if (!RequestValidator.validateTenantContext(req, res)) return;
      if (!RequestValidator.validateUserContext(req, res)) return;

      // Validate date range
      const dateValidation = RequestValidator.validateDateRange(startDate, endDate);
      if (!dateValidation.valid) {
        return ApiResponse.validationError(res, [dateValidation.error!]);
      }

      // Calculate total days using utility
      let totalDays = BusinessLogic.calculateWorkingDays(startDate, endDate);
      
      // Adjust for half-day
      if (isHalfDay) {
        totalDays = 0.5;
      }

      // Check leave balance
      const user = await User.findById(req.user?.userId);
      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      // Check if sufficient balance
      const balanceCheck = BusinessLogic.hasSufficientLeaveBalance(
        user.leaveBalance,
        leaveType,
        totalDays
      );

      if (!balanceCheck.sufficient) {
        return ApiResponse.error(res, balanceCheck.error!, 400);
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
      console.error('Create leave request error:', error);
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

      // Filter by permission: team vs all
      const canApproveAll = PermissionChecker.canApproveLeaves(req.user?.role as UserRole);
      const canApproveTeam = !canApproveAll && userHasPermission(req.user?.role as UserRole, Permission.CAN_APPROVE_TEAM_LEAVE);
      
      if (canApproveTeam && req.user) {
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
   * Approve leave request (Supervisor/HR/Admin/Employer)
   */
  static async approveLeaveRequest(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { leaveId } = req.params;
      const { comments }: IApproveLeaveRequest = req.body;

      // Validate ID
      const idValidation = RequestValidator.validateObjectId(leaveId, 'Leave ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      const leave = await LeaveRequest.findOne({
        _id: leaveId,
        tenantId: req.user?.tenantId,
        status: LeaveStatus.PENDING
      }).populate('userId', 'firstName lastName');

      if (!leave) {
        return ApiResponse.notFound(res, 'Leave request not found or already processed');
      }

      // Deduct leave balance
      const user = await User.findById(leave.userId);
      if (user) {
        user.leaveBalance = BusinessLogic.deductLeaveBalance(
          user.leaveBalance,
          leave.leaveType,
          leave.totalDays
        );
        await user.save();
      }

      leave.status = LeaveStatus.APPROVED;
      leave.approvedBy = req.user?.userId;
      leave.approvedAt = new Date();
      if (comments) leave.approvalComments = comments;

      await leave.save();

      // Send notification
      const approver = await User.findById(req.user?.userId);
      if (approver && user) {
        await NotificationService.notifyLeaveApproved(
          req.user!.tenantId,
          String(leave.userId),
          formatLeaveType(leave.leaveType),
          DateUtil.formatDate(leave.startDate),
          DateUtil.formatDate(leave.endDate),
          approver.fullName
        );
      }

      const responseData = toLeaveRequestResponse(leave);
      return ApiResponse.success(res, responseData, 'Leave request approved successfully');
    } catch (error) {
      console.error('Approve leave error:', error);
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

      // Validate ID
      const idValidation = RequestValidator.validateObjectId(leaveId, 'Leave ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      // Validate required fields
      if (!RequestValidator.validateRequiredFields(req.body, ['comments'], res)) return;

      const leave = await LeaveRequest.findOne({
        _id: leaveId,
        tenantId: req.user?.tenantId,
        status: LeaveStatus.PENDING
      });

      if (!leave) {
        return ApiResponse.notFound(res, 'Leave request not found or already processed');
      }

      leave.status = LeaveStatus.REJECTED;
      leave.rejectedBy = req.user?.userId;
      leave.rejectedAt = new Date();
      leave.approvalComments = comments;

      await leave.save();

      // Send notification
      const approver = await User.findById(req.user?.userId);
      if (approver) {
        await NotificationService.notifyLeaveRejected(
          req.user!.tenantId,
          String(leave.userId),
          formatLeaveType(leave.leaveType),
          DateUtil.formatDate(leave.startDate),
          DateUtil.formatDate(leave.endDate),
          approver.fullName,
          comments
        );
      }

      const responseData = toLeaveRequestResponse(leave);
      return ApiResponse.success(res, responseData, 'Leave request rejected');
    } catch (error) {
      console.error('Reject leave error:', error);
      return ApiResponse.error(res, 'Failed to reject leave request', 500);
    }
  }

  /**
   * Get leave statistics (HR/Admin/Employer)
   */
  static async getLeaveStatistics(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      // Validate context
      if (!RequestValidator.validateTenantContext(req, res)) return;

      const { startDate, endDate } = BusinessLogic.getYearRange();

      const leaves = await LeaveRequest.find({
        tenantId: req.user!.tenantId,
        status: LeaveStatus.APPROVED,
        startDate: { $gte: startDate, $lte: endDate }
      });

      // Group by type using utility
      const grouped = BusinessLogic.groupBy(leaves, 'leaveType');
      
      const byType: Record<LeaveType, { count: number; totalDays: number }> = {} as any;
      for (const type of Object.values(LeaveType)) {
        const typeLeaves = grouped[type] || [];
        byType[type] = {
          count: typeLeaves.length,
          totalDays: BusinessLogic.sum(typeLeaves.map((l: any) => l.totalDays))
        };
      }

      const byStatus: Record<LeaveStatus, number> = {} as any;
      for (const status of Object.values(LeaveStatus)) {
        byStatus[status] = leaves.filter(l => l.status === status).length;
      }

      const stats = {
        totalLeaves: leaves.length,
        totalDays: BusinessLogic.sum(leaves.map((l: any) => l.totalDays)),
        byType,
        byStatus
      };

      return ApiResponse.success(res, stats, 'Leave statistics retrieved successfully');
    } catch (error) {
      console.error('Get leave statistics error:', error);
      return ApiResponse.error(res, 'Failed to retrieve leave statistics', 500);
    }
  }
}




