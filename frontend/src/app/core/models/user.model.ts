/**
 * User Model - Frontend
 * Re-exports shared types and adds frontend-specific interfaces
 */

// Import enums as values for use in this file
import {
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

// Re-export enums as values
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

// Import types for use in this file
import type {
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
  ILeaveRequestDTO
} from '@shared/types';

// Re-export types
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
  ILeaveRequestDTO
} from '@shared/types';

// Frontend-specific interfaces
export interface User {
  _id: string;
  tenantId: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  department?: string;
  designation?: string;
  dateOfJoining?: Date | string;
  dateOfBirth?: Date | string;
  gender?: Gender;
  address?: IAddress | string;
  employmentType?: EmploymentType;
  reportingManagerId?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Additional frontend-only fields
  fullName?: string;
  avatar?: string;
}

export interface LoginRequest extends ILoginDTO {}

export interface RegisterRequest extends IRegisterDTO {
  phoneNumber?: string;
  department?: string;
  designation?: string;
  role?: UserRole;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  errors?: string[];
}

// Helper to check if response was successful
export function isSuccessResponse(response: AuthResponse): boolean {
  return response.status === 'success';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest extends IPasswordResetRequestDTO {}

export interface ResetPasswordRequest extends IPasswordResetDTO {}

