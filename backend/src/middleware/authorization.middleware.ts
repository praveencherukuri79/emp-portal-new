import { Response, NextFunction } from 'express';
import { IAuthRequest, UserRole } from '../types';
import { ApiResponse } from '../utils';

/**
 * Role-Based Authorization Middleware
 * Checks if user has required role(s) to access resource
 */

// Role hierarchy (lower to higher privileges)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.PROSPECT]: 1,
  [UserRole.EMPLOYEE]: 2,
  [UserRole.SUPERVISOR]: 3,
  [UserRole.HR]: 4,
  [UserRole.ADMIN]: 5,
  [UserRole.EMPLOYER]: 6
} as const;

// Helper function to get role hierarchy value
const getRoleValue = (role: UserRole): number => ROLE_HIERARCHY[role];

/**
 * Check if user has at least the minimum required role
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const userRole = req.user.role;
    const hasPermission = allowedRoles.some(
      role => getRoleValue(userRole) >= getRoleValue(role)
    );

    if (!hasPermission) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Check if user has exactly one of the specified roles
 */
export const authorizeExact = (...exactRoles: UserRole[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!exactRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Required roles: ${exactRoles.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Check if user can access resource (self or has higher role)
 */
export const authorizeSelfOrRole = (...roles: UserRole[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const targetUserId = req.params.userId || req.params.id;
    const isSelf = req.user.userId === targetUserId;
    const hasRole = roles.some(
      role => getRoleValue(req.user!.role) >= getRoleValue(role)
    );

    if (!isSelf && !hasRole) {
      return ApiResponse.forbidden(res, 'Access denied');
    }

    next();
  };
};

/**
 * Check if user is HR or above
 */
export const requireHR = authorize(UserRole.HR);

/**
 * Check if user is Supervisor or above
 */
export const requireSupervisor = authorize(UserRole.SUPERVISOR);

/**
 * Check if user is Admin or above
 */
export const requireAdmin = authorize(UserRole.ADMIN);

/**
 * Check if user is Employer
 */
export const requireEmployer = authorizeExact(UserRole.EMPLOYER);
