/**
 * Response Interfaces
 * Used by both Frontend and Backend to ensure API response consistency
 * All backend controllers should return IApiResponse<T> where T matches these interfaces
 */

import type { 
  UserRole, 
  LeaveType, 
  LeaveStatus, 
  TimesheetStatus, 
  DocumentCategory,
  NotificationType,
  NotificationPriority,
  EmploymentType,
  ILeaveBalance
} from './index';
import type { IEmployerWorkforceOverview, IEmployerFinancialOverview, IEmployerAnalyticsOverview } from './index';

// ==================== AUTH RESPONSES ====================

export interface IAuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  tenantId: string;
}

export interface ILoginResponse {
  user: IAuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface IRegisterResponse {
  user: IAuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ==================== USER RESPONSES ====================

export interface IUserResponse {
  _id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  designation?: string;
  phoneNumber?: string;
  dateOfJoining?: Date | string;
  employmentType?: EmploymentType;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IUsersListResponse {
  users: IUserResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ITeamMembersResponse {
  members: IUserResponse[];
}

// ==================== TIMESHEET RESPONSES ====================

export interface ITimesheetEntryResponse {
  _id: string;
  userId: string;
  date: Date | string;
  project: string;
  task?: string;
  description?: string;
  hours: number;
  hoursWorked?: number;
  isBillable: boolean;
  status: TimesheetStatus;
  weekStartDate?: Date | string;
  weekEndDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IWeeklyTimesheetResponse {
  weekStart: Date | string;
  weekEnd: Date | string;
  status: TimesheetStatus;
  entries: ITimesheetEntryResponse[];
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
}

export interface ITimesheetHistoryResponse {
  weekStart: Date | string;
  weekEnd: Date | string;
  status: TimesheetStatus;
  totalHours: number;
  billableHours: number;
  entries: ITimesheetEntryResponse[];
  submittedAt?: Date | string;
  approvedAt?: Date | string;
}

export interface IPendingTimesheetApprovalResponse {
  weekStart: Date | string;
  weekEnd: Date | string;
  userId: string;
  userName: string;
  totalHours: number;
  billableHours: number;
  entries: ITimesheetEntryResponse[];
  submittedAt: Date | string;
}

// ==================== LEAVE RESPONSES ====================

export interface ILeaveRequestResponse {
  _id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: Date | string;
  endDate: Date | string;
  totalDays: number;
  isHalfDay?: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  rejectedBy?: string;
  approvedAt?: Date | string;
  rejectedAt?: Date | string;
  rejectionReason?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ILeaveBalanceResponse extends ILeaveBalance {
  // Already defined in shared types
}

export interface ILeaveCalendarResponse {
  date: Date | string;
  leaves: Array<{
    userId: string;
    userName: string;
    leaveType: LeaveType;
    isHalfDay: boolean;
  }>;
}

export interface ILeaveStatisticsResponse {
  totalLeaves: number;
  totalDays: number;
  byType: Record<LeaveType, { count: number; totalDays: number }>;
  byStatus: Record<LeaveStatus, number>;
}

// ==================== DOCUMENT RESPONSES ====================

export interface IDocumentResponse {
  _id: string;
  userId: string;
  fileName: string;
  originalName: string;
  category: DocumentCategory;
  description?: string;
  documentNumber?: string;
  issueDate?: Date | string;
  expiryDate?: Date | string;
  fileSize: number;
  mimeType: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==================== NOTIFICATION RESPONSES ====================

export interface INotificationResponse {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  priority?: NotificationPriority;
  actionUrl?: string;
  relatedEntity?: {
    entityType: string;
    entityId: string;
  };
  createdAt: Date | string;
  readAt?: Date | string;
}

export interface INotificationsListResponse {
  notifications: INotificationResponse[];
  unreadCount: number;
}

export interface IUnreadCountResponse {
  count: number;
}

// ==================== DASHBOARD RESPONSES ====================

export interface IProspectDashboardResponse {
  profileCompletion: number;
  missingFields: string[];
  accountStatus: string;
  joinedDate: Date | string;
  nextSteps: string[];
}

export interface IEmployeeDashboardResponse {
  timesheet: {
    monthHours: number;
    monthBillable: number;
    weekStatus: string;
  };
  leave: {
    balance: ILeaveBalance;
    upcoming: ILeaveRequestResponse[];
  };
  documents: {
    expiring: number;
    expiringList: IDocumentResponse[];
  };
  quickActions: Array<{ label: string; route: string }>;
  pendingApprovals: number;
}

export interface ISupervisorDashboardResponse {
  team: {
    size: number;
    active: number;
  };
  approvals: {
    timesheets: number;
    leaves: number;
    leaveRequests: ILeaveRequestResponse[];
  };
  teamPerformance: Array<{
    userId: string;
    totalHours: number;
    billableHours: number;
  }>;
  quickActions: Array<{ label: string; route: string }>;
}

export interface IHRDashboardResponse {
  employees: {
    total: number;
    newHires: number;
    onLeaveToday: number;
  };
  leaves: {
    pending: number;
    approved: number;
    rejected: number;
  };
  documents: {
    expiring: number;
    expiringList: IDocumentResponse[];
  };
  quickActions: Array<{ label: string; route: string }>;
}

export interface IAdminDashboardResponse {
  users: Array<{
    role: UserRole;
    count: number;
    active: number;
  }>;
  activity: {
    timesheets: number;
    leaves: number;
    documents: number;
  };
  quickActions: Array<{ label: string; route: string }>;
}

export interface IEmployerDashboardResponse {
  workforce: {
    totalEmployees: number;
    departments: number;
  };
  financial: {
    monthlyPayroll: number;
    billableHours: number;
  };
  leave: Array<{
    leaveType: LeaveType;
    count: number;
    totalDays: number;
  }>;
  quickActions: Array<{ label: string; route: string }>;
}

// ==================== REPORT RESPONSES ====================

export interface ITimesheetReportResponse {
  summary: {
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    totalEntries: number;
  };
  entries: ITimesheetEntryResponse[];
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
}

export interface ILeaveReportResponse {
  summary: {
    totalLeaves: number;
    totalDays: number;
    approved: number;
    pending: number;
    rejected: number;
    byType: Record<LeaveType, { count: number; totalDays: number }>;
  };
  leaves: ILeaveRequestResponse[];
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
}

export interface ITeamReportResponse {
  teamSize: number;
  teamMembers: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      employeeId?: string;
      role: UserRole;
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

// ==================== PROJECT RESPONSES ====================

export interface IProjectResponse {
  _id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IProjectsListResponse {
  projects: IProjectResponse[];
}

// ==================== TIMESHEET APPROVAL RESPONSES ====================

export interface ITimesheetApprovalActionResponse {
  count: number;
}

export interface IPendingTimesheetGroupResponse {
  userId: string | { _id: string; firstName: string; lastName: string; email: string; employeeId?: string };
  weekStartDate: Date | string;
  weekEndDate: Date | string;
  entries: ITimesheetEntryResponse[];
  totalHours: number;
}

// ==================== APPROVAL RESPONSES ====================

export interface IApprovalResponse {
  _id: string;
  type: 'timesheet' | 'leave';
  entityId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedAt: Date | string;
  approvedBy?: string;
  approvedAt?: Date | string;
  rejectedBy?: string;
  rejectedAt?: Date | string;
  comments?: string;
  rejectionReason?: string;
}

export interface IPendingApprovalsResponse {
  timesheets: IPendingTimesheetGroupResponse[];
  leaves: ILeaveRequestResponse[];
}

export interface IApprovalHistoryResponse {
  approvals: IApprovalResponse[];
}

// ==================== SETTINGS RESPONSES ====================

export interface ITenantResponse {
  _id: string;
  name: string;
  domain: string;
  logo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  contactEmail: string;
  contactPhone?: string;
  settings: {
    workDaysPerWeek: number;
    workHoursPerDay: number;
    currency: string;
    dateFormat: string;
    timeZone: string;
  };
  subscription: {
    plan: string;
    startDate: Date | string;
    endDate?: Date | string;
    maxUsers: number;
  };
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==================== EMPLOYER RESPONSES ====================
// These are already defined in shared/types/index.ts as IEmployerWorkforceOverview, etc.
// Re-export for clarity
export type IWorkforceOverviewResponse = IEmployerWorkforceOverview;
export type IFinancialOverviewResponse = IEmployerFinancialOverview;
export type IAnalyticsOverviewResponse = IEmployerAnalyticsOverview;

