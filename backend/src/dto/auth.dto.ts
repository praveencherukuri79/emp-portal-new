import {
  ILoginResponse,
  IRegisterResponse,
  IRefreshTokenResponse
} from '@shared/types/responses';
import User from '../models/user.model';
import { IUser } from '../types';
import { Document } from 'mongoose';

/**
 * Convert User model to IAuthUser (for login/register responses)
 */
function toAuthUser(user: Document & IUser) {
  return {
    _id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    employeeId: user.employeeId,
    department: user.department,
    designation: user.designation,
    isActive: user.isActive,
    tenantId: String(user.tenantId)
  };
}

/**
 * Convert to ILoginResponse
 */
export function toLoginResponse(
  user: Document & IUser,
  accessToken: string,
  refreshToken: string
): ILoginResponse {
  return {
    user: toAuthUser(user),
    accessToken,
    refreshToken
  };
}

/**
 * Convert to IRegisterResponse
 */
export function toRegisterResponse(
  user: Document & IUser,
  accessToken: string,
  refreshToken: string
): IRegisterResponse {
  return {
    user: toAuthUser(user),
    accessToken,
    refreshToken
  };
}

/**
 * Convert to IRefreshTokenResponse
 */
export function toRefreshTokenResponse(
  accessToken: string,
  refreshToken: string
): IRefreshTokenResponse {
  return {
    accessToken,
    refreshToken
  };
}

