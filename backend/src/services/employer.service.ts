import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import {
  IEmployerAnalyticsOverview,
  IEmployerFinancialOverview,
  IEmployerFinancialSummary,
  IEmployerPerformanceTrends,
  IEmployerProductivityMetrics,
  IEmployerResourceUtilization,
  IEmployerWorkforceOverview,
  IEmployerWorkforceSummary
} from '@shared/types';
import { EmploymentType, LeaveStatus, TimesheetStatus, UserRole } from '../types';
import User from '../models/user.model';
import TimesheetEntry from '../models/timesheet.model';
import LeaveRequest from '../models/leave.model';

dayjs.extend(quarterOfYear);

type FinancialPeriod = 'month' | 'quarter' | 'year';

const BILLABLE_HOURLY_RATE = 150; // Default rate for calculating revenue
const BENEFITS_MULTIPLIER = 0.2; // Benefits as % of payroll
const SOFTWARE_COST_PER_USER = 120; // Monthly software investment per employee

const calculatePercentage = (value: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }

  return Number(((value / total) * 100).toFixed(1));
};

const getTenureBucket = (months: number): string => {
  if (months < 12) return '< 1 year';
  if (months < 36) return '1 - 3 years';
  if (months < 60) return '3 - 5 years';
  return '5+ years';
};

const getPeriodStart = (period: FinancialPeriod): dayjs.Dayjs => {
  const now = dayjs();

  switch (period) {
    case 'year':
      return now.startOf('year');
    case 'quarter':
      return now.startOf('quarter');
    default:
      return now.startOf('month');
  }
};

class EmployerService {
  static async getWorkforceOverview(tenantId: string): Promise<IEmployerWorkforceOverview> {
    const employees = await User.find({
      tenantId,
      role: { $ne: UserRole.PROSPECT }
    })
      .select('firstName lastName email role department employmentType isActive joiningDate salary')
      .lean();

    const employeeMap = new Map<string, (typeof employees)[number]>();
    employees.forEach(emp => {
      employeeMap.set(String(emp._id), emp);
    });

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.isActive).length;
    const inactiveEmployees = totalEmployees - activeEmployees;

    const thirtyDaysAgo = dayjs().subtract(30, 'day');
    const newHires = employees.filter(emp => emp.joiningDate && dayjs(emp.joiningDate).isAfter(thirtyDaysAgo));

    const totalTenureMonths = employees.reduce((acc, emp) => {
      if (!emp.joiningDate) return acc;
      const tenureMonths = dayjs().diff(dayjs(emp.joiningDate), 'month');
      return acc + Math.max(tenureMonths, 0);
    }, 0);

    const averageTenureMonths =
      activeEmployees > 0 ? Number((totalTenureMonths / activeEmployees).toFixed(1)) : 0;

    const summary: IEmployerWorkforceSummary = {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      newHiresLast30Days: newHires.length,
      averageTenureMonths
    };

    const departmentCounts = new Map<string, number>();
    const employmentTypeCounts = new Map<EmploymentType | 'Unknown', number>();
    const tenureCounts = new Map<string, number>();

    employees.forEach(emp => {
      const department = emp.department || 'Unassigned';
      departmentCounts.set(department, (departmentCounts.get(department) ?? 0) + 1);

      const employmentType = emp.employmentType || EmploymentType.FULL_TIME;
      employmentTypeCounts.set(employmentType, (employmentTypeCounts.get(employmentType) ?? 0) + 1);

      const tenureMonths = emp.joiningDate ? dayjs().diff(dayjs(emp.joiningDate), 'month') : 0;
      const tenureBucket = getTenureBucket(tenureMonths);
      tenureCounts.set(tenureBucket, (tenureCounts.get(tenureBucket) ?? 0) + 1);
    });

    const departmentDistribution = Array.from(departmentCounts.entries()).map(([label, count]) => ({
      label,
      count,
      percentage: calculatePercentage(count, totalEmployees)
    }));

    const employmentTypeDistribution = Array.from(employmentTypeCounts.entries()).map(([label, count]) => ({
      label,
      count,
      percentage: calculatePercentage(count, totalEmployees)
    }));

    const tenureDistribution = Array.from(tenureCounts.entries()).map(([label, count]) => ({
      label,
      count,
      percentage: calculatePercentage(count, totalEmployees)
    }));

    const timesheetAgg = await TimesheetEntry.aggregate([
      {
        $match: {
          tenantId,
          date: { $gte: thirtyDaysAgo.toDate() },
          status: { $in: [TimesheetStatus.APPROVED, TimesheetStatus.SUBMITTED] }
        }
      },
      {
        $group: {
          _id: '$userId',
          billableHours: {
            $sum: {
              $cond: ['$isBillable', '$hours', 0]
            }
          }
        }
      },
      { $sort: { billableHours: -1 } },
      { $limit: 5 }
    ]);

    const topPerformers = timesheetAgg
      .filter(item => item.billableHours > 0)
      .map(item => {
        const employee = employeeMap.get(String(item._id));
        return {
          userId: String(item._id),
          fullName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
          department: employee?.department || 'Unassigned',
          billableHours: Number(item.billableHours.toFixed(1))
        };
      });

    const recentHires = [...newHires]
      .sort((a, b) => dayjs(b.joiningDate ?? 0).valueOf() - dayjs(a.joiningDate ?? 0).valueOf())
      .slice(0, 5)
      .map(emp => ({
        userId: String(emp._id),
        fullName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department || 'Unassigned',
        joiningDate: emp.joiningDate ? dayjs(emp.joiningDate).format('YYYY-MM-DD') : undefined,
        employmentType: emp.employmentType
      }));

    const employeeList = employees.map(emp => ({
      userId: String(emp._id),
      fullName: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      department: emp.department || 'Unassigned',
      role: emp.role,
      employmentType: emp.employmentType || EmploymentType.FULL_TIME,
      isActive: emp.isActive,
      joiningDate: emp.joiningDate ? dayjs(emp.joiningDate).format('YYYY-MM-DD') : undefined,
      firstName: emp.firstName,
      lastName: emp.lastName
    }));

    return {
      summary,
      departmentDistribution,
      employmentTypeDistribution,
      tenureDistribution,
      topPerformers,
      recentHires,
      employees: employeeList
    };
  }

  static async getFinancialOverview(
    tenantId: string,
    period: FinancialPeriod
  ): Promise<IEmployerFinancialOverview> {
    const periodStart = getPeriodStart(period);
    const activeEmployees = await User.find({
      tenantId,
      isActive: true,
      role: { $ne: UserRole.PROSPECT }
    })
      .select('salary amount employmentType department')
      .lean();

    const employeeMap = new Map<string, (typeof activeEmployees)[number]>();
    activeEmployees.forEach(emp => {
      employeeMap.set(String(emp._id), emp);
    });

    const timesheetEntries = await TimesheetEntry.aggregate([
      {
        $match: {
          tenantId,
          date: { $gte: periodStart.toDate() },
          status: { $in: [TimesheetStatus.APPROVED, TimesheetStatus.SUBMITTED] }
        }
      },
      {
        $project: {
          userId: 1,
          project: 1,
          date: 1,
          month: { $dateToString: { format: '%Y-%m', date: '$date' } },
          hours: '$hours',
          billableHours: {
            $cond: ['$isBillable', '$hours', 0]
          }
        }
      }
    ]);

    const billableHours = timesheetEntries.reduce((sum, entry) => sum + entry.billableHours, 0);

    const revenueByProjectMap = new Map<string, { revenue: number; billableHours: number }>();
    timesheetEntries.forEach(entry => {
      const project = entry.project || 'Unassigned';
      const metrics = revenueByProjectMap.get(project) ?? { revenue: 0, billableHours: 0 };
      metrics.billableHours += entry.billableHours;
      metrics.revenue += entry.billableHours * BILLABLE_HOURLY_RATE;
      revenueByProjectMap.set(project, metrics);
    });

    const totalRevenue = Array.from(revenueByProjectMap.values()).reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    const revenueByDepartmentMap = new Map<string, number>();
    timesheetEntries.forEach(entry => {
      const employee = employeeMap.get(String(entry.userId));
      const department = employee?.department || 'Unassigned';
      revenueByDepartmentMap.set(
        department,
        (revenueByDepartmentMap.get(department) ?? 0) + entry.billableHours * BILLABLE_HOURLY_RATE
      );
    });

    const revenueByDepartment = Array.from(revenueByDepartmentMap.entries())
      .map(([department, revenue]) => ({
        department,
        revenue,
        percentage: calculatePercentage(revenue, totalRevenue)
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const revenueByMonthMap = new Map<
      string,
      { revenue: number; billableHours: number }
    >();
    timesheetEntries.forEach(entry => {
      const metrics = revenueByMonthMap.get(entry.month) ?? { revenue: 0, billableHours: 0 };
      metrics.billableHours += entry.billableHours;
      metrics.revenue += entry.billableHours * BILLABLE_HOURLY_RATE;
      revenueByMonthMap.set(entry.month, metrics);
    });

    const revenueByMonth = Array.from(revenueByMonthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, metrics]) => ({
        period,
        revenue: Number(metrics.revenue.toFixed(2)),
        billableHours: Number(metrics.billableHours.toFixed(1))
      }));

    const topProjects = Array.from(revenueByProjectMap.entries())
      .map(([project, metrics]) => ({
        project,
        revenue: Number(metrics.revenue.toFixed(2)),
        billableHours: Number(metrics.billableHours.toFixed(1))
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const monthlyPayroll = activeEmployees.reduce((sum, emp) => {
      const salaryAmount = emp.salary?.amount ?? 0;
      return sum + salaryAmount;
    }, 0);

    const benefitsExpense = monthlyPayroll * BENEFITS_MULTIPLIER;
    const softwareExpense = activeEmployees.length * SOFTWARE_COST_PER_USER;
    const operationsExpense = totalRevenue * 0.12; // Assumed operational overhead

    const expensesByCategoryBase = [
      { category: 'Payroll', amount: monthlyPayroll },
      { category: 'Benefits', amount: benefitsExpense },
      { category: 'Software & Tools', amount: softwareExpense },
      { category: 'Operations', amount: operationsExpense }
    ];

    const totalExpenses = expensesByCategoryBase.reduce((sum, expense) => sum + expense.amount, 0);

    const expensesByCategory = expensesByCategoryBase.map(expense => ({
      ...expense,
      amount: Number(expense.amount.toFixed(2)),
      percentage: calculatePercentage(expense.amount, totalExpenses)
    }));

    const summary: IEmployerFinancialSummary = {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      monthlyPayroll: Number(monthlyPayroll.toFixed(2)),
      billableHours: Number(billableHours.toFixed(1)),
      revenuePerEmployee:
        activeEmployees.length > 0
          ? Number((totalRevenue / activeEmployees.length).toFixed(2))
          : 0,
      grossMargin:
        totalRevenue > 0
          ? Number((((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1))
          : 0
    };

    return {
      summary,
      revenueByDepartment,
      revenueByMonth,
      topProjects,
      expensesByCategory
    };
  }

  static async getBusinessAnalytics(tenantId: string): Promise<IEmployerAnalyticsOverview> {
    const sixtyDaysAgo = dayjs().subtract(60, 'day');
    const sixMonthsAgo = dayjs().subtract(6, 'month').startOf('month');

    const timesheetAnalytics = await TimesheetEntry.aggregate([
      {
        $match: {
          tenantId,
          date: { $gte: sixMonthsAgo.toDate() },
          status: { $in: [TimesheetStatus.APPROVED, TimesheetStatus.SUBMITTED] }
        }
      },
      {
        $project: {
          userId: 1,
          project: 1,
          date: 1,
          month: { $dateToString: { format: '%Y-%m', date: '$date' } },
          hours: '$hours',
          billableHours: {
            $cond: ['$isBillable', '$hours', 0]
          },
          overtimeHours: {
            $cond: [
              { $gt: ['$hours', 8] },
              { $subtract: ['$hours', 8] },
              0
            ]
          }
        }
      }
    ]);

    const recentTimesheets = timesheetAnalytics.filter(entry =>
      dayjs(entry.date).isAfter(sixtyDaysAgo)
    );

    const totalBillableHours = recentTimesheets.reduce(
      (sum, entry) => sum + entry.billableHours,
      0
    );
    const totalHours = recentTimesheets.reduce((sum, entry) => sum + entry.hours, 0);
    const totalNonBillableHours = totalHours - totalBillableHours;
    const overtimeHours = recentTimesheets.reduce((sum, entry) => sum + entry.overtimeHours, 0);

    const activeEmployeesCount = await User.countDocuments({
      tenantId,
      isActive: true,
      role: { $ne: UserRole.PROSPECT }
    });

    const productivity: IEmployerProductivityMetrics = {
      utilizationRate: totalHours > 0 ? Number(((totalBillableHours / totalHours) * 100).toFixed(1)) : 0,
      averageBillableHours:
        activeEmployeesCount > 0
          ? Number((totalBillableHours / activeEmployeesCount).toFixed(1))
          : 0,
      billableHours: Number(totalBillableHours.toFixed(1)),
      nonBillableHours: Number(totalNonBillableHours.toFixed(1)),
      overtimeHours: Number(overtimeHours.toFixed(1))
    };

    const departmentUtilizationMap = new Map<string, { billableHours: number; totalHours: number }>();
    const employeeDepartmentMap = new Map<string, string>();

    const employeeDepartments = await User.find({
      tenantId,
      isActive: true
    })
      .select('department')
      .lean();

    employeeDepartments.forEach(emp => {
      employeeDepartmentMap.set(String(emp._id), emp.department || 'Unassigned');
    });

    recentTimesheets.forEach(entry => {
      const department = employeeDepartmentMap.get(String(entry.userId)) || 'Unassigned';
      const metrics = departmentUtilizationMap.get(department) ?? { billableHours: 0, totalHours: 0 };
      metrics.billableHours += entry.billableHours;
      metrics.totalHours += entry.hours;
      departmentUtilizationMap.set(department, metrics);
    });

    const departmentUtilization = Array.from(departmentUtilizationMap.entries()).map(
      ([department, metrics]) => ({
        department,
        utilization:
          metrics.totalHours > 0
            ? Number(((metrics.billableHours / metrics.totalHours) * 100).toFixed(1))
            : 0
      })
    );

    const projectAllocationMap = new Map<string, number>();
    recentTimesheets.forEach(entry => {
      const project = entry.project || 'Unassigned';
      projectAllocationMap.set(
        project,
        (projectAllocationMap.get(project) ?? 0) + entry.billableHours
      );
    });

    const totalProjectHours = Array.from(projectAllocationMap.values()).reduce(
      (sum, hours) => sum + hours,
      0
    );

    const projectAllocation = Array.from(projectAllocationMap.entries())
      .map(([project, hours]) => ({
        project,
        allocation: calculatePercentage(hours, totalProjectHours)
      }))
      .sort((a, b) => b.allocation - a.allocation)
      .slice(0, 6);

    const timesheetHoursMap = new Map<
      string,
      { totalHours: number; billableHours: number }
    >();
    timesheetAnalytics.forEach(entry => {
      const metrics = timesheetHoursMap.get(entry.month) ?? { totalHours: 0, billableHours: 0 };
      metrics.totalHours += entry.hours;
      metrics.billableHours += entry.billableHours;
      timesheetHoursMap.set(entry.month, metrics);
    });

    const timesheetHours = Array.from(timesheetHoursMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, metrics]) => ({
        period,
        totalHours: Number(metrics.totalHours.toFixed(1)),
        billableHours: Number(metrics.billableHours.toFixed(1))
      }));

    const leaveTrendAgg = await LeaveRequest.aggregate([
      {
        $match: {
          tenantId,
          startDate: { $gte: sixMonthsAgo.toDate() },
          status: LeaveStatus.APPROVED
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$startDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const leaveTrend = leaveTrendAgg.map(item => ({
      period: item._id,
      count: item.count
    }));

    const hiringTrendMap = new Map<string, number>();
    const recentHires = await User.find({
      tenantId,
      joiningDate: { $gte: sixMonthsAgo.toDate() }
    })
      .select('joiningDate')
      .lean();

    recentHires.forEach(emp => {
      if (!emp.joiningDate) return;
      const period = dayjs(emp.joiningDate).format('YYYY-MM');
      hiringTrendMap.set(period, (hiringTrendMap.get(period) ?? 0) + 1);
    });

    const hiringTrend = Array.from(hiringTrendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, count]) => ({ period, count }));

    const resourceUtilization: IEmployerResourceUtilization = {
      departmentUtilization,
      projectAllocation
    };

    const performanceTrends: IEmployerPerformanceTrends = {
      timesheetHours,
      leaveTrend,
      hiringTrend
    };

    return {
      productivity,
      resourceUtilization,
      performanceTrends
    };
  }
}

export default EmployerService;

