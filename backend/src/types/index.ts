// Type definitions for the application

import { Request } from 'express';
import { Document } from 'mongoose';

// ==================== ENUMS ====================

export enum UserRole {
  PROSPECT = 'prospect',
  EMPLOYEE = 'employee',
  SUPERVISOR = 'supervisor',
  HR = 'hr',
  ADMIN = 'admin',
  EMPLOYER = 'employer'
}

export enum EmploymentType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  INTERN = 'intern'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer-not-to-say'
}

export enum VisaStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING = 'pending',
  NOT_APPLICABLE = 'not-applicable'
}

export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity'
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum DocumentCategory {
  VISA = 'visa',
  PASSPORT = 'passport',
  CONTRACT = 'contract',
  CERTIFICATION = 'certification',
  TAX = 'tax',
  INSURANCE = 'insurance',
  OTHER = 'other'
}

export enum NotificationType {
  TIMESHEET_SUBMITTED = 'timesheet_submitted',
  TIMESHEET_APPROVED = 'timesheet_approved',
  TIMESHEET_REJECTED = 'timesheet_rejected',
  LEAVE_SUBMITTED = 'leave_submitted',
  LEAVE_APPROVED = 'leave_approved',
  LEAVE_REJECTED = 'leave_rejected',
  DOCUMENT_EXPIRING = 'document_expiring',
  DOCUMENT_SHARED = 'document_shared',
  PASSWORD_RESET = 'password_reset',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  OTHER = 'other'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// ==================== INTERFACES ====================

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface ISalary {
  amount?: number;
  currency?: string;
}

export interface IVisa {
  type?: string;
  number?: string;
  expiryDate?: Date;
  status?: VisaStatus;
}

export interface ILeaveBalance {
  annual: number;
  sick: number;
  personal: number;
  unpaid: number;
  maternity: number;
  paternity: number;
}

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

// ==================== RESPONSE INTERFACES ====================

export interface IApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== DTO INTERFACES ====================

export interface IRegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // Single-tenant deployment - no tenantDomain needed
}

export interface ILoginDTO {
  email: string;
  password: string;
  // Single-tenant deployment - no tenantDomain needed
}

export interface IPasswordResetRequestDTO {
  email: string;
  // Single-tenant deployment - no tenantDomain needed
}

export interface IPasswordResetDTO {
  token: string;
  newPassword: string;
}

export interface ITimesheetEntryDTO {
  date: Date;
  project: string;
  task?: string;
  description?: string;
  hours: number;
  isBillable?: boolean;
}

export interface ILeaveRequestDTO {
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  isHalfDay?: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  reason: string;
}

// ==================== UTILITY TYPES ====================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = (...args: any[]) => Promise<T>;
