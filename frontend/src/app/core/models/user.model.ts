export enum UserRole {
  PROSPECT = 'prospect',
  EMPLOYEE = 'employee',
  SUPERVISOR = 'supervisor',
  HR = 'hr',
  ADMIN = 'admin',
  EMPLOYER = 'employer'
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export interface User {
  _id: string;
  tenantId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  department?: string;
  designation?: string;
  dateOfJoining?: Date;
  dateOfBirth?: Date;
  gender?: Gender;
  address?: string;
  employmentType?: EmploymentType;
  reportingManagerId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  // Single-tenant deployment - no tenantId needed
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  department?: string;
  designation?: string;
  role?: UserRole;
}

export interface AuthResponse {
  status: string;  // Backend returns 'success' or 'error'
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

// Helper to check if response was successful
export function isSuccessResponse(response: AuthResponse): boolean {
  return response.status === 'success';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
