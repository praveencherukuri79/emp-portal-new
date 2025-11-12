import { Response } from 'express';
import ExcelJS from 'exceljs';
import dayjs from 'dayjs';

export interface TimesheetExcelData {
  summary: {
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    totalEntries: number;
  };
  entries: Array<{
    _id: string;
    userId: string;
    date: Date | string;
    project: string;
    task?: string;
    description?: string;
    hours: number;
    hoursWorked?: number;
    isBillable: boolean;
    status: string;
  }>;
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
}

export interface LeaveExcelData {
  summary: {
    totalLeaves: number;
    totalDays: number;
    approved: number;
    pending: number;
    rejected: number;
    byType: Record<string, { count: number; totalDays: number }>;
  };
  leaves: Array<{
    _id: string;
    userId: string | { firstName: string; lastName: string; email: string; employeeId?: string };
    leaveType: string;
    startDate: Date | string;
    endDate: Date | string;
    totalDays: number;
    status: string;
    reason?: string;
  }>;
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
}

export interface TeamExcelData {
  teamSize: number;
  teamMembers: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      employeeId?: string;
      role: string;
    };
    timesheetSummary: {
      totalHours: number;
      billableHours: number;
      entriesCount: number;
    };
    leaveSummary: {
      totalLeaves: number;
      totalDays: number;
      pending: number;
    };
  }>;
}

/**
 * Generate Timesheet Excel
 */
export async function generateTimesheetExcel(data: TimesheetExcelData, res: Response): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Timesheet Report');

  // Headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'User ID', key: 'userId', width: 20 },
    { header: 'Project', key: 'project', width: 20 },
    { header: 'Task', key: 'task', width: 20 },
    { header: 'Hours', key: 'hours', width: 10 },
    { header: 'Billable', key: 'billable', width: 10 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Description', key: 'description', width: 40 }
  ];

  // Data
  data.entries.forEach((entry) => {
    const date = typeof entry.date === 'string' ? entry.date : dayjs(entry.date).format('YYYY-MM-DD');
    worksheet.addRow({
      date,
      userId: entry.userId,
      project: entry.project,
      task: entry.task || 'N/A',
      hours: entry.hoursWorked || entry.hours,
      billable: entry.isBillable ? 'Yes' : 'No',
      status: entry.status,
      description: entry.description || 'N/A'
    });
  });

  // Summary row
  worksheet.addRow({});
  worksheet.addRow({
    date: 'SUMMARY',
    hours: data.summary.totalHours.toFixed(2),
    billable: `${data.summary.billableHours.toFixed(2)} billable`
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=timesheet-report-${Date.now()}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
}

/**
 * Generate Leave Excel
 */
export async function generateLeaveExcel(data: LeaveExcelData, res: Response): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Leave Report');

  worksheet.columns = [
    { header: 'User ID', key: 'userId', width: 20 },
    { header: 'Leave Type', key: 'leaveType', width: 15 },
    { header: 'Start Date', key: 'startDate', width: 15 },
    { header: 'End Date', key: 'endDate', width: 15 },
    { header: 'Days', key: 'days', width: 10 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Reason', key: 'reason', width: 40 }
  ];

  data.leaves.forEach((leave) => {
    const startDate = typeof leave.startDate === 'string' ? leave.startDate : dayjs(leave.startDate).format('YYYY-MM-DD');
    const endDate = typeof leave.endDate === 'string' ? leave.endDate : dayjs(leave.endDate).format('YYYY-MM-DD');
    const userId = typeof leave.userId === 'object' 
      ? `${leave.userId.firstName} ${leave.userId.lastName} (${leave.userId.employeeId || 'N/A'})`
      : leave.userId;
    
    worksheet.addRow({
      userId,
      leaveType: leave.leaveType,
      startDate,
      endDate,
      days: leave.totalDays,
      status: leave.status,
      reason: leave.reason || 'N/A'
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=leave-report-${Date.now()}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
}

/**
 * Generate Team Excel
 */
export async function generateTeamExcel(data: TeamExcelData, res: Response): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Team Report');

  worksheet.columns = [
    { header: 'Employee ID', key: 'employeeId', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Total Hours', key: 'totalHours', width: 12 },
    { header: 'Billable Hours', key: 'billableHours', width: 15 },
    { header: 'Leave Days', key: 'leaveDays', width: 12 },
    { header: 'Pending Leaves', key: 'pendingLeaves', width: 15 }
  ];

  data.teamMembers.forEach((member) => {
    worksheet.addRow({
      employeeId: member.user.employeeId || 'N/A',
      name: member.user.name,
      email: member.user.email,
      role: member.user.role,
      totalHours: member.timesheetSummary.totalHours,
      billableHours: member.timesheetSummary.billableHours,
      leaveDays: member.leaveSummary.totalDays,
      pendingLeaves: member.leaveSummary.pending
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=team-report-${Date.now()}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
}

