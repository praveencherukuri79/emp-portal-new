import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import { ApiResponse, TokenUtil } from '../utils';
import User from '../models/user.model';
import Tenant from '../models/tenant.model';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */

export const authenticate = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Extract token from header
    const token = TokenUtil.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return ApiResponse.unauthorized(res, 'No token provided');
    }

    // Verify token
    const decoded = TokenUtil.verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
      email: decoded.email
    };

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return ApiResponse.unauthorized(res, 'User not found or inactive');
    }

    // Verify tenant is active
    const tenant = await Tenant.findById(decoded.tenantId);
    if (!tenant || !tenant.isActive) {
      return ApiResponse.unauthorized(res, 'Tenant not found or inactive');
    }

    req.tenant = tenant;

    next();
  } catch (error: any) {
    return ApiResponse.unauthorized(res, error.message || 'Invalid token');
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalAuthenticate = async (
  req: IAuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = TokenUtil.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = TokenUtil.verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        role: decoded.role,
        email: decoded.email
      };
    }
  } catch (_error) {
    // Ignore errors for optional auth
  }

  next();
};
