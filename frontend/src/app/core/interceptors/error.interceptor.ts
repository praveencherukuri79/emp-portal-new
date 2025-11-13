import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Error Interceptor
 * Handles HTTP errors globally
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Bad request. Please check your input.';
            break;
          case 401:
            errorMessage = error.error?.message || 'Unauthorized. Please login again.';
            // Clear auth and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            router.navigate(['/auth/login'], {
              queryParams: { 
                returnUrl: router.url,
                error: 'session_expired'
              }
            });
            break;
          case 403:
            errorMessage = error.error?.message || 'Access denied. You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = error.error?.message || 'Resource not found.';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflict. The resource already exists.';
            break;
          case 422:
            errorMessage = error.error?.message || 'Validation failed. Please check your input.';
            if (error.error?.errors && Array.isArray(error.error.errors)) {
              errorMessage = error.error.errors.join(', ');
            }
            break;
          case 429:
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          case 503:
            errorMessage = 'Service unavailable. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Server returned code ${error.status}`;
        }
      }

      // Log error for debugging
      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: req.url,
        method: req.method,
        error: error.error
      });

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        errors: error.error?.errors || [],
        originalError: error
      }));
    })
  );
};

