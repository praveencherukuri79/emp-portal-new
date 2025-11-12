import { TimesheetEntry, LeaveRequest, User } from '../models';
import { UserRole, LeaveStatus } from '../types';
import dayjs from 'dayjs';

export interface TimesheetReportParams {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  userRole: UserRole;
  currentUserId?: string;
}

export interface LeaveReportParams {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  leaveType?: string;
  userRole: UserRole;
  currentUserId?: string;
}

export interface TeamReportParams {
  tenantId: string;
  departmentId?: string;
  userRole: UserRole;
  currentUserId?: string;
}

export class ReportService {
  /**
   * Get timesheet report data
   */
  async getTimesheetReport(params: TimesheetReportParams) {
    const { tenantId, startDate, endDate, userId, userRole, currentUserId } = params;

    const query: any = {
      tenantId
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
    } else if (![UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER].includes(userRole)) {
      query.userId = currentUserId;
    }

    const entries = await TimesheetEntry.find(query).sort({ date: -1 });

    // Calculate summary
    const summary = {
      totalHours: entries.reduce((sum: number, entry) => sum + entry.hours, 0),
      billableHours: entries.filter(e => e.isBillable).reduce((sum: number, entry) => sum + entry.hours, 0),
      nonBillableHours: entries.filter(e => !e.isBillable).reduce((sum: number, entry) => sum + entry.hours, 0),
      totalEntries: entries.length
    };

    return {
      summary,
      entries,
      dateRange: { startDate, endDate }
    };
  }

  /**
   * Get leave report data
   */
  async getLeaveReport(params: LeaveReportParams) {
    const { tenantId, startDate, endDate, userId, leaveType, userRole, currentUserId } = params;

    const query: any = {
      tenantId
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
    } else if (![UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER].includes(userRole)) {
      query.userId = currentUserId;
    }

    if (leaveType) query.leaveType = leaveType;

    const leaves = await LeaveRequest.find(query)
      .populate('userId', 'firstName lastName email employeeId')
      .sort({ startDate: -1 });

    // Calculate summary
    const summary = {
      totalLeaves: leaves.length,
      totalDays: leaves.reduce((sum: number, leave) => sum + leave.totalDays, 0),
      approved: leaves.filter((l) => l.status === LeaveStatus.APPROVED).length,
      pending: leaves.filter((l) => l.status === LeaveStatus.PENDING).length,
      rejected: leaves.filter((l) => l.status === LeaveStatus.REJECTED).length,
      byType: {} as Record<string, { count: number; totalDays: number }>
    };

    // Group by leave type
    leaves.forEach((leave) => {
      if (!summary.byType[leave.leaveType]) {
        summary.byType[leave.leaveType] = {
          count: 0,
          totalDays: 0
        };
      }
      summary.byType[leave.leaveType].count++;
      summary.byType[leave.leaveType].totalDays += leave.totalDays;
    });

    return {
      summary,
      leaves,
      dateRange: { startDate, endDate }
    };
  }

  /**
   * Get team report data
   */
  async getTeamReport(params: TeamReportParams) {
    const { tenantId, departmentId, userRole, currentUserId } = params;

    const query: any = {
      tenantId,
      isActive: true
    };

    if (departmentId) query.departmentId = departmentId;

    // If supervisor, only show their team
    if (userRole === UserRole.SUPERVISOR) {
      query.supervisorId = currentUserId;
    }

    const users = await User.find(query).select('-password');

    // Get timesheet summary for each user (last 30 days)
    const thirtyDaysAgo = dayjs().subtract(30, 'days').toDate();
    const teamData = await Promise.all(
      users.map(async (user) => {
        const timesheetEntries = await TimesheetEntry.find({
          tenantId,
          userId: user._id,
          date: { $gte: thirtyDaysAgo }
        });

        const leaveRequests = await LeaveRequest.find({
          tenantId,
          userId: user._id,
          startDate: { $gte: thirtyDaysAgo }
        });

        return {
          user: {
            id: String(user._id),
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            employeeId: user.employeeId,
            role: user.role
          },
          timesheetSummary: {
            totalHours: timesheetEntries.reduce((sum: number, e) => sum + e.hours, 0),
            billableHours: timesheetEntries.filter(e => e.isBillable).reduce((sum: number, e) => sum + e.hours, 0),
            entriesCount: timesheetEntries.length
          },
          leaveSummary: {
            totalLeaves: leaveRequests.length,
            totalDays: leaveRequests.reduce((sum: number, l) => sum + l.totalDays, 0),
            pending: leaveRequests.filter((l) => l.status === LeaveStatus.PENDING).length
          }
        };
      })
    );

    return {
      teamSize: users.length,
      teamMembers: teamData
    };
  }
}

