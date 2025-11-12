// Type definitions for the application
// Re-export shared types and add backend-specific types

import { Request } from 'express';
import { Document } from 'mongoose';

// Import shared types for use in this file
import type {
  UserRole,
  EmploymentType,
  Gender,
  TimesheetStatus,
  LeaveType,
  LeaveStatus,
  DocumentCategory,
  NotificationType,
  NotificationPriority,
  IAddress,
  ISalary,
  IVisa,
  ILeaveBalance
} from '@shared/types';

// Re-export enums as values (needed for runtime usage)
export {
  UserRole,
  EmploymentType,
  Gender,
  VisaStatus,
  TimesheetStatus,
  LeaveType,
  LeaveStatus,
  DocumentCategory,
  NotificationType,
  NotificationPriority
} from '@shared/types';

// Re-export types and interfaces
export type {
  IAddress,
  ISalary,
  IVisa,
  ILeaveBalance,
  IApiResponse,
  IPaginatedResponse,
  IRegisterDTO,
  ILoginDTO,
  IPasswordResetRequestDTO,
  IPasswordResetDTO,
  ITimesheetEntryDTO,
  ILeaveRequestDTO,
  Nullable,
  Optional,
  AsyncFunction
} from '@shared/types';

// ==================== BACKEND-SPECIFIC INTERFACES ====================

export interface ITenantSettings {
  workDaysPerWeek: number;
  workHoursPerDay: number;
  currency: string;
  dateFormat: string;
  timeZone: string;
}

export interface ISubscription {
  plan: 'trial' | 'basic' | 'premium' | 'enterprise';
  startDate: Date;
  endDate?: Date;
  maxUsers: number;
}

export interface ISharedDocument {
  userId: string;
  sharedAt: Date;
  canDownload: boolean;
}

export interface IExpiryNotification {
  thirtyDays: boolean;
  fifteenDays: boolean;
  sevenDays: boolean;
}

export interface IRelatedEntity {
  entityType: 'timesheet' | 'leave' | 'document' | 'user';
  entityId: string;
}

// ==================== DOCUMENT INTERFACES ====================

export interface ITenant extends Document {
  name: string;
  domain: string;
  logo?: string;
  address?: IAddress;
  contactEmail: string;
  contactPhone?: string;
  settings: ITenantSettings;
  subscription: ISubscription;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  tenantId: string;
  email: string;
  password: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastPasswordChange?: Date;
  role: UserRole;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: Gender;
  phone?: string;
  avatar?: string;
  address?: IAddress;
  employeeId?: string;
  department?: string;
  designation?: string;
  joiningDate?: Date;
  employmentType: EmploymentType;
  salary?: ISalary;
  reportingTo?: string;
  visa?: IVisa;
  leaveBalance: ILeaveBalance;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  lastLogin?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

export interface ITimesheetEntry extends Document {
  tenantId: string;
  userId: string;
  date: Date;
  weekStartDate: Date;
  weekEndDate: Date;
  year: number;
  weekNumber: number;
  project: string;
  task?: string;
  description?: string;
  hours: number;
  isBillable: boolean;
  status: TimesheetStatus;
  submittedAt?: Date;
  submittedBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  approvalComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeaveRequest extends Document {
  tenantId: string;
  userId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  isHalfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  totalDays: number;
  reason: string;
  attachments?: Array<{
    filename: string;
    path: string;
    uploadedAt: Date;
  }>;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  approvalComments?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocument extends Document {
  tenantId: string;
  userId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  description?: string;
  documentNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  sharedWith: ISharedDocument[];
  isPrivate: boolean;
  isActive: boolean;
  expiryNotificationSent: IExpiryNotification;
  scanStatus: 'pending' | 'clean' | 'infected' | 'not-scanned';
  scannedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity?: IRelatedEntity;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  priority: NotificationPriority;
  emailSent: boolean;
  emailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== REQUEST INTERFACES ====================

export interface IAuthRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    role: UserRole;
    email: string;
  };
  tenant?: ITenant;
  body: any;  // Will be properly typed in controllers
  params: any; // Will be properly typed in controllers
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface IFilterQuery extends IPaginationQuery {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

// DTOs are re-exported from shared types above
