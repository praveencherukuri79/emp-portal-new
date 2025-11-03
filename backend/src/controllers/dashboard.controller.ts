import { Response } from 'express';
import { User, TimesheetEntry, LeaveRequest, Document } from '../models';
import { ApiResponse } from '../utils/response.util';
import { IAuthRequest, UserRole } from '../types';
import dayjs from 'dayjs';

export class DashboardController {
  /**
   * Get Prospect Dashboard
   */
  static async getProspectDashboard(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const user = await User.findById(req.user?.userId);
      
      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
        return;
      }

      // Calculate profile completion
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'address'];
      const completedFields = requiredFields.filter(field => user[field as keyof typeof user]);
      const profileCompletion = Math.round((completedFields.length / requiredFields.length) * 100);

      const dashboardData = {
        profileCompletion,
        missingFields: requiredFields.filter(field => !user[field as keyof typeof user]),
        accountStatus: user.isActive ? 'Active' : 'Inactive',
        joinedDate: user.createdAt,
        nextSteps: [
          'Complete your profile',
          'Upload required documents',
          'Wait for HR approval'
        ]
      };

      return ApiResponse.success(res, dashboardData, 'Prospect dashboard data retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve prospect dashboard');
    }
  }

  /**
   * Get Employee Dashboard
   */
  static async getEmployeeDashboard(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const today = dayjs().startOf('day').toDate();
      const monthStart = dayjs().startOf('month').toDate();

      // Get timesheet stats
      const timesheetStats = await TimesheetEntry.aggregate([
        {
          $match: {
            tenantId: req.user?.tenantId,
            userId: req.user?.userId,
            date: { $gte: monthStart }
          }
        },
        {
          $group: {
            _id: null,
            totalHours: { $sum: '$hoursWorked' },
            billableHours: {
              $sum: {
                $cond: ['$isBillable', '$hoursWorked', 0]
              }
            }
          }
        }
      ]);

      // Get leave balance
      const user = await User.findById(req.user?.userId);
      
      // Get upcoming leaves
      const upcomingLeaves = await LeaveRequest.find({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        startDate: { $gte: today },
        status: { $in: ['Pending', 'Approved'] }
      }).sort({ startDate: 1 }).limit(3);

      // Get pending approvals (if supervisor)
      let pendingApprovals = 0;
      if (user?.role === UserRole.SUPERVISOR) {
        pendingApprovals = await LeaveRequest.countDocuments({
          tenantId: req.user?.tenantId,
          status: 'Pending'
        });
      }

      // Get expiring documents
      const thirtyDaysFromNow = dayjs().add(30, 'days').toDate();
      const expiringDocuments = await Document.find({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        expiryDate: {
          $gte: today,
          $lte: thirtyDaysFromNow
        },
        isActive: true
      }).sort({ expiryDate: 1 });

      const dashboardData = {
        timesheet: {
          monthHours: timesheetStats[0]?.totalHours || 0,
          monthBillable: timesheetStats[0]?.billableHours || 0,
          weekStatus: 'Not Submitted' // Will be calculated based on entries
        },
        leave: {
          balance: user?.leaveBalance || {},
          upcoming: upcomingLeaves
        },
        documents: {
          expiring: expiringDocuments.length,
          expiringList: expiringDocuments
        },
        quickActions: [
          { label: 'Submit Timesheet', route: '/timesheet' },
          { label: 'Request Leave', route: '/leave/request' },
          { label: 'Upload Document', route: '/documents/upload' }
        ],
        pendingApprovals
      };

      return ApiResponse.success(res, dashboardData, 'Employee dashboard data retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve employee dashboard');
    }
  }

  /**
   * Get Supervisor Dashboard
   */
  static async getSupervisorDashboard(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      // Get team members
      const teamMembers = await User.find({
        tenantId: req.user?.tenantId,
        supervisorId: req.user?.userId,
        isActive: true
      });

      // Get pending timesheet approvals
      const pendingTimesheets = await TimesheetEntry.countDocuments({
        tenantId: req.user?.tenantId,
        status: 'Submitted'
      });

      // Get pending leave approvals
      const pendingLeaves = await LeaveRequest.find({
        tenantId: req.user?.tenantId,
        status: 'Pending'
      }).populate('userId', 'firstName lastName email employeeId');

      // Team timesheet summary (this month)
      const monthStart = dayjs().startOf('month').toDate();
      const teamTimesheetStats = await TimesheetEntry.aggregate([
        {
          $match: {
            tenantId: req.user?.tenantId,
            date: { $gte: monthStart }
          }
        },
        {
          $group: {
            _id: '$userId',
            totalHours: { $sum: '$hoursWorked' },
            billableHours: {
              $sum: {
                $cond: ['$isBillable', '$hoursWorked', 0]
              }
            }
          }
        }
      ]);

      const dashboardData = {
        team: {
          size: teamMembers.length,
          active: teamMembers.filter(m => m.isActive).length
        },
        approvals: {
          timesheets: pendingTimesheets,
          leaves: pendingLeaves.length,
          leaveRequests: pendingLeaves
        },
        teamPerformance: teamTimesheetStats,
        quickActions: [
          { label: 'Review Timesheets', route: '/approvals/timesheets' },
          { label: 'Review Leave Requests', route: '/approvals/leaves' },
          { label: 'Team Report', route: '/reports/team' }
        ]
      };

      return ApiResponse.success(res, dashboardData, 'Supervisor dashboard data retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve supervisor dashboard');
    }
  }

  /**
   * Get HR Dashboard
   */
  static async getHRDashboard(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const today = dayjs().startOf('day').toDate();
      const monthStart = dayjs().startOf('month').toDate();

      // Total employees
      const totalEmployees = await User.countDocuments({
        tenantId: req.user?.tenantId,
        role: { $in: [UserRole.EMPLOYEE, UserRole.SUPERVISOR] },
        isActive: true
      });

      // New hires this month
      const newHires = await User.countDocuments({
        tenantId: req.user?.tenantId,
        createdAt: { $gte: monthStart },
        isActive: true
      });

      // Leave statistics
      const leaveStats = await LeaveRequest.aggregate([
        {
          $match: {
            tenantId: req.user?.tenantId,
            startDate: { $gte: monthStart }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Employees on leave today
      const onLeaveToday = await LeaveRequest.countDocuments({
        tenantId: req.user?.tenantId,
        startDate: { $lte: today },
        endDate: { $gte: today },
        status: 'Approved'
      });

      // Expiring documents (next 30 days)
      const thirtyDaysFromNow = dayjs().add(30, 'days').toDate();
      const expiringDocuments = await Document.find({
        tenantId: req.user?.tenantId,
        expiryDate: {
          $gte: today,
          $lte: thirtyDaysFromNow
        },
        isActive: true
      })
        .populate('userId', 'firstName lastName email employeeId')
        .sort({ expiryDate: 1 });

      // Pending approvals
      const pendingLeaves = await LeaveRequest.countDocuments({
        tenantId: req.user?.tenantId,
        status: 'Pending'
      });

      const dashboardData = {
        employees: {
          total: totalEmployees,
          newHires,
          onLeaveToday
        },
        leaves: {
          pending: pendingLeaves,
          approved: leaveStats.find(s => s._id === 'Approved')?.count || 0,
          rejected: leaveStats.find(s => s._id === 'Rejected')?.count || 0
        },
        documents: {
          expiring: expiringDocuments.length,
          expiringList: expiringDocuments.slice(0, 10)
        },
        quickActions: [
          { label: 'Manage Employees', route: '/users' },
          { label: 'Review Leave Requests', route: '/approvals/leaves' },
          { label: 'Document Alerts', route: '/documents/expiring' },
          { label: 'Generate Reports', route: '/reports' }
        ]
      };

      return ApiResponse.success(res, dashboardData, 'HR dashboard data retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve HR dashboard');
    }
  }

  /**
   * Get Admin Dashboard
   */
  static async getAdminDashboard(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const monthStart = dayjs().startOf('month').toDate();

      // User statistics
      const userStats = await User.aggregate([
        {
          $match: { tenantId: req.user?.tenantId }
        },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: {
              $sum: { $cond: ['$isActive', 1, 0] }
            }
          }
        }
      ]);

      // System activity (this month)
      const timesheetCount = await TimesheetEntry.countDocuments({
        tenantId: req.user?.tenantId,
        createdAt: { $gte: monthStart }
      });

      const leaveCount = await LeaveRequest.countDocuments({
        tenantId: req.user?.tenantId,
        createdAt: { $gte: monthStart }
      });

      const documentCount = await Document.countDocuments({
        tenantId: req.user?.tenantId,
        createdAt: { $gte: monthStart }
      });

      const dashboardData = {
        users: userStats,
        activity: {
          timesheets: timesheetCount,
          leaves: leaveCount,
          documents: documentCount
        },
        quickActions: [
          { label: 'User Management', route: '/admin/users' },
          { label: 'System Settings', route: '/admin/settings' },
          { label: 'Audit Logs', route: '/admin/audit' },
          { label: 'System Reports', route: '/reports/system' }
        ]
      };

      return ApiResponse.success(res, dashboardData, 'Admin dashboard data retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve admin dashboard');
    }
  }

  /**
   * Get Employer Dashboard
   */
  static async getEmployerDashboard(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const monthStart = dayjs().startOf('month').toDate();
      const yearStart = dayjs().startOf('year').toDate();

      // Total employees
      const totalEmployees = await User.countDocuments({
        tenantId: req.user?.tenantId,
        isActive: true
      });

      // Payroll summary (this month) - based on employee salaries
      const payrollData = await User.aggregate([
        {
          $match: {
            tenantId: req.user?.tenantId,
            isActive: true,
            'employeeInfo.salary': { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            totalSalary: { $sum: '$employeeInfo.salary' }
          }
        }
      ]);

      // Timesheet billable hours (this month)
      const billableStats = await TimesheetEntry.aggregate([
        {
          $match: {
            tenantId: req.user?.tenantId,
            date: { $gte: monthStart },
            isBillable: true
          }
        },
        {
          $group: {
            _id: null,
            totalBillableHours: { $sum: '$hoursWorked' }
          }
        }
      ]);

      // Leave statistics (this year)
      const leaveStats = await LeaveRequest.aggregate([
        {
          $match: {
            tenantId: req.user?.tenantId,
            startDate: { $gte: yearStart },
            status: 'Approved'
          }
        },
        {
          $group: {
            _id: '$leaveType',
            count: { $sum: 1 },
            totalDays: { $sum: '$totalDays' }
          }
        }
      ]);

      // Department-wise headcount (if departments exist)
      const departmentStats = await User.aggregate([
        {
          $match: {
            tenantId: req.user?.tenantId,
            isActive: true
          }
        },
        {
          $group: {
            _id: '$departmentId',
            count: { $sum: 1 }
          }
        }
      ]);

      const dashboardData = {
        workforce: {
          totalEmployees,
          departments: departmentStats.length
        },
        financial: {
          monthlyPayroll: payrollData[0]?.totalSalary || 0,
          billableHours: billableStats[0]?.totalBillableHours || 0
        },
        leave: leaveStats,
        quickActions: [
          { label: 'Financial Reports', route: '/reports/financial' },
          { label: 'Workforce Analytics', route: '/reports/workforce' },
          { label: 'Company Settings', route: '/settings/company' }
        ]
      };

      return ApiResponse.success(res, dashboardData, 'Employer dashboard data retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve employer dashboard');
    }
  }

  /**
   * Get role-based dashboard
   */
  static async getDashboard(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const role = req.user?.role;

      switch (role) {
        case UserRole.PROSPECT:
          return DashboardController.getProspectDashboard(req, res);
        case UserRole.EMPLOYEE:
          return DashboardController.getEmployeeDashboard(req, res);
        case UserRole.SUPERVISOR:
          return DashboardController.getSupervisorDashboard(req, res);
        case UserRole.HR:
          return DashboardController.getHRDashboard(req, res);
        case UserRole.ADMIN:
          return DashboardController.getAdminDashboard(req, res);
        case UserRole.EMPLOYER:
          return DashboardController.getEmployerDashboard(req, res);
        default:
          return ApiResponse.forbidden(res, 'Invalid role');
      }
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve dashboard');
    }
  }
}




