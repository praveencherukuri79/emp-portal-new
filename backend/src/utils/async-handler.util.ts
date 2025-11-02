import { Request, Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import { ApiResponse, HttpStatus } from './response-handler.util';

/**
 * Async Handler Utility
 * Wraps async route handlers to catch errors automatically
 */

type AsyncFunction = (
  req: Request | IAuthRequest,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wraps an async function to catch errors
 */
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request | IAuthRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Error in async handler:', error);
      
      // Handle known error types
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((e: any) => e.message);
        return ApiResponse.validationError(res, errors);
      }

      if (error.name === 'CastError') {
        return ApiResponse.badRequest(res, 'Invalid ID format');
      }

      if (error.code === 11000) {
        return ApiResponse.conflict(res, 'Resource already exists');
      }

      if (error.name === 'JsonWebTokenError') {
        return ApiResponse.unauthorized(res, 'Invalid token');
      }

      if (error.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized(res, 'Token expired');
      }

      // Default error response
      return ApiResponse.error(
        res,
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    });
  };
};

/**
 * Create a controller method with automatic error handling
 */
export const createHandler = (fn: AsyncFunction) => asyncHandler(fn);
