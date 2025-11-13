import { Response } from 'express';
import { IApiResponse, IPaginatedResponse } from '../types';

/**
 * Reusable API Response Utilities
 * Provides consistent response formatting across all endpoints
 */

export class ApiResponse {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const response: IApiResponse<T> = {
      status: 'success',
      message,
      data
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated success response
   */
  static successWithPagination<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message: string = 'Success'
  ): Response {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const response: IApiResponse<IPaginatedResponse<T>> = {
      status: 'success',
      message,
      data: {
        data,
        pagination: {
          ...pagination,
          totalPages
        }
      }
    };

    return res.status(200).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 500,
    errors?: string[]
  ): Response {
    const response: IApiResponse = {
      status: 'error',
      message,
      ...(errors && { errors })
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: string[]
  ): Response {
    return ApiResponse.error(res, 'Validation failed', 400, errors);
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    resource: string = 'Resource'
  ): Response {
    return ApiResponse.error(res, `${resource} not found`, 404);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response {
    return ApiResponse.error(res, message, 401);
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): Response {
    return ApiResponse.error(res, message, 403);
  }

  /**
   * Send bad request response
   */
  static badRequest(
    res: Response,
    message: string = 'Bad request'
  ): Response {
    return ApiResponse.error(res, message, 400);
  }

  /**
   * Send conflict response
   */
  static conflict(
    res: Response,
    message: string = 'Resource already exists'
  ): Response {
    return ApiResponse.error(res, message, 409);
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
