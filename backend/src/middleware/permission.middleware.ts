/**
 * Permission Middleware
 * Checks if user has specific permissions using the permission system
 */

import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import { ApiResponse } from '../utils';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@shared/types/permissions';

/**
 * Require specific permission
 */
export const requirePermission = (permission: Permission) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!hasPermission(req.user.role, permission)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Required permission: ${permission}`
      );
    }

    next();
  };
};

/**
 * Require any of the specified permissions
 */
export const requireAnyPermission = (...permissions: Permission[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!hasAnyPermission(req.user.role, permissions)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Required permissions (any): ${permissions.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Require all specified permissions
 */
export const requireAllPermissions = (...permissions: Permission[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!hasAllPermissions(req.user.role, permissions)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Required permissions (all): ${permissions.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Check permission utility for use in controllers
 */
export const userHasPermission = (req: IAuthRequest, permission: Permission): boolean => {
  return hasPermission(req.user?.role, permission);
};

/**
 * Check any permission utility for use in controllers
 */
export const userHasAnyPermission = (req: IAuthRequest, permissions: Permission[]): boolean => {
  return hasAnyPermission(req.user?.role, permissions);
};

/**
 * Check all permissions utility for use in controllers
 */
export const userHasAllPermissions = (req: IAuthRequest, permissions: Permission[]): boolean => {
  return hasAllPermissions(req.user?.role, permissions);
};

