import { IUserResponse, IUsersListResponse } from '@shared/types/responses';
import { User } from '../models';
import { IUser } from '../types';
import { Document } from 'mongoose';

/**
 * Convert User model to IUserResponse
 */
export function toUserResponse(user: Document & IUser): IUserResponse {
  return {
    _id: String(user._id),
    tenantId: String(user.tenantId),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    employeeId: user.employeeId,
    department: user.department,
    designation: user.designation,
    phoneNumber: user.phone,
    dateOfJoining: user.joiningDate,
    employmentType: user.employmentType,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

/**
 * Convert array of User models to IUsersListResponse
 */
export function toUsersListResponse(
  users: (Document & IUser)[],
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  }
): IUsersListResponse {
  return {
    users: users.map(toUserResponse),
    pagination
  };
}

