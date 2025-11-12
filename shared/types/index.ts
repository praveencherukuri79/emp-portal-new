/**
 * Shared Types, Interfaces, and Enums
 * Used by both Frontend and Backend to ensure type consistency
 * 
 * IMPORTANT: Both frontend and backend should import from this file
 * to avoid type mismatches and ensure API compatibility
 * 
 * Response interfaces are exported separately from @shared/types/responses
 * Import directly: import { ILoginResponse, IUserResponse } from '@shared/types/responses'
 */

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

export enum ApprovalType {
  TIMESHEET = 'timesheet',
  LEAVE = 'leave'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
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
  expiryDate?: Date | string;
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

// ==================== API RESPONSE INTERFACES ====================

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
  phoneNumber?: string;
  department?: string;
  designation?: string;
  role?: UserRole;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IPasswordResetRequestDTO {
  email: string;
}

export interface IPasswordResetDTO {
  token: string;
  newPassword: string;
}

export interface ITimesheetEntryDTO {
  date: Date | string;
  project: string;
  task?: string;
  description?: string;
  hours: number;
  isBillable?: boolean;
}

export interface ILeaveRequestDTO {
  leaveType: LeaveType;
  startDate: Date | string;
  endDate: Date | string;
  isHalfDay?: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  reason: string;
}

// ==================== APPROVAL INTERFACES ====================

export interface IApprovalRequest {
  _id?: string;
  type: ApprovalType;
  requestId: string;
  requestorId: string;
  requestorName: string;
  approverId: string;
  approverName?: string;
  tenantId: string;
  status: ApprovalStatus;
  requestData: any;
  submittedAt: Date | string;
  reviewedAt?: Date | string;
  comments?: string;
  rejectionReason?: string;
}

export interface ITimesheetApprovalData {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  billableHours: number;
  entries: number;
}

export interface ILeaveApprovalData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
}

export interface IBulkApprovalRequest {
  approvalIds: string[];
  status: 'approved' | 'rejected';
  comments?: string;
}

// ==================== EMPLOYER ANALYTICS INTERFACES ====================

export interface IEmployerWorkforceSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  newHiresLast30Days: number;
  averageTenureMonths: number;
}

export interface IEmployerDistributionMetric {
  label: string;
  count: number;
  percentage: number;
}

export interface IEmployerTopPerformer {
  userId: string;
  fullName: string;
  department?: string;
  billableHours: number;
}

export interface IEmployerRecentHire {
  userId: string;
  fullName: string;
  department?: string;
  joiningDate?: string;
  employmentType?: EmploymentType;
}

export interface IEmployerWorkforceEmployee extends IEmployerRecentHire {
  email: string;
  role: UserRole;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
}

export interface IEmployerWorkforceOverview {
  summary: IEmployerWorkforceSummary;
  departmentDistribution: IEmployerDistributionMetric[];
  employmentTypeDistribution: IEmployerDistributionMetric[];
  tenureDistribution: IEmployerDistributionMetric[];
  topPerformers: IEmployerTopPerformer[];
  recentHires: IEmployerRecentHire[];
  employees: IEmployerWorkforceEmployee[];
}

export interface IEmployerFinancialSummary {
  totalRevenue: number;
  monthlyPayroll: number;
  billableHours: number;
  revenuePerEmployee: number;
  grossMargin: number;
}

export interface IEmployerFinancialOverview {
  summary: IEmployerFinancialSummary;
  revenueByDepartment: Array<{ department: string; revenue: number; percentage: number }>;
  revenueByMonth: Array<{ period: string; revenue: number; billableHours: number }>;
  topProjects: Array<{ project: string; revenue: number; billableHours: number }>;
  expensesByCategory: Array<{ category: string; amount: number; percentage: number }>;
}

export interface IEmployerProductivityMetrics {
  utilizationRate: number;
  averageBillableHours: number;
  billableHours: number;
  nonBillableHours: number;
  overtimeHours: number;
}

export interface IEmployerDepartmentUtilization {
  department: string;
  utilization: number;
}

export interface IEmployerProjectAllocation {
  project: string;
  allocation: number;
}

export interface IEmployerResourceUtilization {
  departmentUtilization: IEmployerDepartmentUtilization[];
  projectAllocation: IEmployerProjectAllocation[];
}

export interface IEmployerTimesheetTrend {
  period: string;
  totalHours: number;
  billableHours: number;
}

export interface IEmployerCountTrend {
  period: string;
  count: number;
}

export interface IEmployerPerformanceTrends {
  timesheetHours: IEmployerTimesheetTrend[];
  leaveTrend: IEmployerCountTrend[];
  hiringTrend: IEmployerCountTrend[];
}

export interface IEmployerAnalyticsOverview {
  productivity: IEmployerProductivityMetrics;
  resourceUtilization: IEmployerResourceUtilization;
  performanceTrends: IEmployerPerformanceTrends;
}

// ==================== UTILITY TYPES ====================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = (...args: any[]) => Promise<T>;

// Request interfaces are exported separately to avoid backend rootDir issues
// Import directly: import { IChangePasswordRequest } from '@shared/types/requests'
// Constants are also exported separately
// Import directly: import { API_ENDPOINTS } from '@shared/types/constants'

