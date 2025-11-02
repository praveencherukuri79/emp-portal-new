import { Response } from 'express';

/**
 * Enhanced API Response Utilities with Better TypeScript Support
 */

// Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: ResponseMeta;
  timestamp: string;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

// HTTP Status Codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

/**
 * Enhanced API Response Handler
 */
export class ApiResponse {
  /**
   * Send successful response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: HttpStatus = HttpStatus.OK
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    } as IApiResponse<T>);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationOptions,
    message: string = 'Data retrieved successfully'
  ): Response {
    const { page, limit, total } = pagination;
    const totalPages = Math.ceil(total / limit);

    return res.status(HttpStatus.OK).json({
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    } as IApiResponse<T[]>);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: string[]
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString()
    } as IApiResponse);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: string[],
    message: string = 'Validation failed'
  ): Response {
    return ApiResponse.error(res, message, HttpStatus.UNPROCESSABLE_ENTITY, errors);
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    resource: string = 'Resource'
  ): Response {
    return ApiResponse.error(res, `${resource} not found`, HttpStatus.NOT_FOUND);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response {
    return ApiResponse.error(res, message, HttpStatus.UNAUTHORIZED);
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): Response {
    return ApiResponse.error(res, message, HttpStatus.FORBIDDEN);
  }

  /**
   * Send conflict response
   */
  static conflict(
    res: Response,
    message: string = 'Resource already exists'
  ): Response {
    return ApiResponse.error(res, message, HttpStatus.CONFLICT);
  }

  /**
   * Send bad request response
   */
  static badRequest(
    res: Response,
    message: string = 'Bad request'
  ): Response {
    return ApiResponse.error(res, message, HttpStatus.BAD_REQUEST);
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return ApiResponse.success(res, data, message, HttpStatus.CREATED);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
