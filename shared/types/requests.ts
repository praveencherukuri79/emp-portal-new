/**
 * Request Body Interfaces
 * Used by both Frontend and Backend to ensure request body consistency
 */

import type { UserRole, LeaveType, DocumentCategory } from './index';
import type { IAddress, ISalary, IVisa } from './index';

// ==================== AUTH REQUESTS ====================

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

export interface ILogoutRequest {
  refreshToken: string;
}

// ==================== USER REQUESTS ====================

export interface IUpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date | string;
  gender?: string;
  phone?: string;
  avatar?: string;
  address?: IAddress;
}

export interface IUpdateEmployeeInfoRequest {
  employeeId?: string;
  department?: string;
  designation?: string;
  joiningDate?: Date | string;
  employmentType?: string;
  salary?: ISalary;
  reportingTo?: string;
  visa?: IVisa;
}

export interface ICreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  department?: string;
  designation?: string;
  employeeId?: string;
  joiningDate?: Date | string;
  employmentType?: string;
  reportingTo?: string;
}

export interface IUpdateUserRoleRequest {
  role: UserRole;
}

// ==================== TIMESHEET REQUESTS ====================

export interface IBatchTimesheetEntriesRequest {
  entries: Array<{
    date: Date | string;
    project: string;
    task?: string;
    description?: string;
    hours: number;
    isBillable?: boolean;
  }>;
}

export interface IUpdateTimesheetEntryRequest {
  project?: string;
  task?: string;
  description?: string;
  hours?: number;
  isBillable?: boolean;
}

export interface ISubmitWeekRequest {
  weekStartDate: string;
  weekStart?: string; // For backward compatibility
}

export interface IApproveTimesheetEntriesRequest {
  entryIds: string[];
  comments?: string;
}

export interface IRejectTimesheetEntriesRequest {
  entryIds: string[];
  comments: string; // Required for rejection
  reason?: string; // Alternative name
}

// ==================== LEAVE REQUESTS ====================

export interface IUpdateLeaveRequestRequest {
  leaveType?: LeaveType;
  startDate?: Date | string;
  endDate?: Date | string;
  isHalfDay?: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  reason?: string;
}

export interface ICancelLeaveRequest {
  cancellationReason?: string;
}

export interface IApproveLeaveRequest {
  comments?: string;
}

export interface IRejectLeaveRequest {
  comments: string; // Required for rejection
  reason?: string; // Alternative name
}

// ==================== DOCUMENT REQUESTS ====================

export interface IUpdateDocumentRequest {
  category?: DocumentCategory;
  description?: string;
  documentNumber?: string;
  issueDate?: Date | string;
  expiryDate?: Date | string;
}

export interface IShareDocumentRequest {
  userIds: string[];
  canDownload: boolean;
}

// ==================== NOTIFICATION REQUESTS ====================

export interface ICreateNotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
  actionUrl?: string;
  sendEmail?: boolean;
  relatedEntity?: {
    entityType: 'timesheet' | 'leave' | 'document' | 'user';
    entityId: string;
  };
}

// ==================== ADMIN REQUESTS ====================

export interface IBulkCreateUsersRequest {
  users: Array<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber?: string;
    department?: string;
    designation?: string;
    employeeId?: string;
    joiningDate?: Date | string;
    employmentType?: string;
    reportingTo?: string;
  }>;
}

export interface IUpdateTenantRequest {
  name?: string;
  domain?: string;
  settings?: {
    workDaysPerWeek?: number;
    workHoursPerDay?: number;
    currency?: string;
    dateFormat?: string;
    timeZone?: string;
  };
}

