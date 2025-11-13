/**
 * Request Validator Utility
 * Provides comprehensive validation for common API request patterns
 */

import { IAuthRequest } from '../types';
import { Response } from 'express';
import { ApiResponse } from './response.util';

export class RequestValidator {
  /**
   * Validate tenant context exists
   */
  static validateTenantContext(req: IAuthRequest, res: Response): boolean {
    if (!req.user?.tenantId) {
      ApiResponse.unauthorized(res, 'Tenant context missing');
      return false;
    }
    return true;
  }

  /**
   * Validate user context exists
   */
  static validateUserContext(req: IAuthRequest, res: Response): boolean {
    if (!req.user?.userId) {
      ApiResponse.unauthorized(res, 'User context missing');
      return false;
    }
    return true;
  }

  /**
   * Validate resource belongs to tenant
   */
  static validateTenantOwnership(resourceTenantId: string, userTenantId: string | undefined): boolean {
    return resourceTenantId === userTenantId;
  }

  /**
   * Validate resource belongs to user or user has permission
   */
  static validateUserOwnershipOrPermission(
    resourceUserId: string, 
    currentUserId: string | undefined,
    hasPermission: boolean
  ): boolean {
    return resourceUserId === currentUserId || hasPermission;
  }

  /**
   * Validate required fields in request body
   */
  static validateRequiredFields(
    body: any, 
    requiredFields: string[], 
    res: Response
  ): boolean {
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      ApiResponse.validationError(
        res, 
        [`Missing required fields: ${missingFields.join(', ')}`]
      );
      return false;
    }
    return true;
  }

  /**
   * Validate date range
   */
  static validateDateRange(startDate: Date | string, endDate: Date | string): {
    valid: boolean;
    error?: string;
  } {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, error: 'Invalid date format' };
    }

    if (start > end) {
      return { valid: false, error: 'End date must be after start date' };
    }

    return { valid: true };
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(page?: number, limit?: number): {
    valid: boolean;
    error?: string;
    page: number;
    limit: number;
  } {
    const validatedPage = Math.max(1, page || 1);
    const validatedLimit = Math.min(Math.max(1, limit || 10), 100);

    return {
      valid: true,
      page: validatedPage,
      limit: validatedLimit
    };
  }

  /**
   * Validate enum value
   */
  static validateEnumValue<T>(
    value: string, 
    enumObj: Record<string, T>,
    fieldName: string = 'field'
  ): {
    valid: boolean;
    error?: string;
  } {
    const validValues = Object.values(enumObj);
    
    if (!validValues.includes(value as unknown as T)) {
      return {
        valid: false,
        error: `Invalid ${fieldName}. Must be one of: ${validValues.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Validate ObjectId format (MongoDB)
   */
  static validateObjectId(id: string, fieldName: string = 'ID'): {
    valid: boolean;
    error?: string;
  } {
    const objectIdRegex = /^[a-f\d]{24}$/i;
    
    if (!objectIdRegex.test(id)) {
      return {
        valid: false,
        error: `Invalid ${fieldName} format`
      };
    }

    return { valid: true };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): {
    valid: boolean;
    error?: string;
  } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        error: 'Invalid email format'
      };
    }

    return { valid: true };
  }

  /**
   * Validate phone number format (basic)
   */
  static validatePhone(phone: string): {
    valid: boolean;
    error?: string;
  } {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
    
    if (!phoneRegex.test(phone)) {
      return {
        valid: false,
        error: 'Invalid phone number format'
      };
    }

    return { valid: true };
  }

  /**
   * Validate numeric range
   */
  static validateNumericRange(
    value: number,
    min: number,
    max: number,
    fieldName: string = 'value'
  ): {
    valid: boolean;
    error?: string;
  } {
    if (value < min || value > max) {
      return {
        valid: false,
        error: `${fieldName} must be between ${min} and ${max}`
      };
    }

    return { valid: true };
  }

  /**
   * Validate string length
   */
  static validateStringLength(
    value: string,
    min: number,
    max: number,
    fieldName: string = 'field'
  ): {
    valid: boolean;
    error?: string;
  } {
    const length = value.length;
    
    if (length < min || length > max) {
      return {
        valid: false,
        error: `${fieldName} must be between ${min} and ${max} characters`
      };
    }

    return { valid: true };
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(
    file: Express.Multer.File | undefined,
    allowedMimeTypes: string[],
    maxSizeBytes: number
  ): {
    valid: boolean;
    error?: string;
  } {
    if (!file) {
      return { valid: false, error: 'No file uploaded' };
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
      };
    }

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSizeBytes / (1024 * 1024)}MB`
      };
    }

    return { valid: true };
  }
}

