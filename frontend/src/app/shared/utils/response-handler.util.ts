/**
 * Response Handler Utility
 * Centralized response handling for API calls
 */

import { IApiResponse } from '@shared/types';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export class ResponseHandler {
  /**
   * Handle API response and extract data
   */
  static handleResponse<T>(response: IApiResponse<T>): T {
    if (response.status === 'success' && response.data !== undefined) {
      return response.data;
    }
    throw new Error(response.message || 'API request failed');
  }

  /**
   * Check if response is successful
   */
  static isSuccess<T>(response: IApiResponse<T>): boolean {
    return response.status === 'success';
  }

  /**
   * Get error messages from response
   */
  static getErrorMessages(response: IApiResponse<any>): string[] {
    if (response.errors && response.errors.length > 0) {
      return response.errors;
    }
    if (response.message) {
      return [response.message];
    }
    return ['An unexpected error occurred'];
  }

  /**
   * Format error for display
   */
  static formatError(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.join(', ');
    }
    if (error.message) {
      return error.message;
    }
    if (error.status === 0) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (error.status === 401) {
      return 'Unauthorized. Please login again.';
    }
    if (error.status === 403) {
      return 'Access denied. You do not have permission to perform this action.';
    }
    if (error.status === 404) {
      return 'Resource not found.';
    }
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return 'An unexpected error occurred';
  }

  /**
   * RxJS operator to extract data from IApiResponse
   */
  static extractData<T>() {
    return (source: Observable<IApiResponse<T>>): Observable<T> => {
      return source.pipe(
        map(response => {
          if (response.status === 'success' && response.data !== undefined) {
            return response.data;
          }
          throw new Error(response.message || 'API request failed');
        })
      );
    };
  }

  /**
   * RxJS operator for standardized error handling
   */
  static handleError() {
    return <T>(source: Observable<T>): Observable<T> => {
      return source.pipe(
        catchError(error => {
          console.error('API Error:', error);
          const errorMessage = ResponseHandler.formatError(error);
          return throwError(() => new Error(errorMessage));
        })
      );
    };
  }

  /**
   * Validate response has required fields
   */
  static validateResponse<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[]
  ): { valid: boolean; missing: string[] } {
    const missing = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null
    ).map(field => String(field));

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Check if response has pagination
   */
  static hasPagination<T>(response: IApiResponse<T>): boolean {
    return !!(response.meta && 
      response.meta.page !== undefined && 
      response.meta.totalPages !== undefined);
  }

  /**
   * Extract pagination info
   */
  static getPaginationInfo<T>(response: IApiResponse<T>): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null {
    if (!response.meta) {
      return null;
    }

    return {
      page: response.meta.page || 1,
      limit: response.meta.limit || 10,
      total: response.meta.total || 0,
      totalPages: response.meta.totalPages || 1
    };
  }
}


