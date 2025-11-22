/**
 * HTTP Utility Functions
 * Shared HTTP helpers to reduce duplication across services
 */

import { HttpParams } from '@angular/common/http';

/**
 * Build HTTP params from object
 * Automatically handles undefined values and conversions
 */
export function buildHttpParams(params: Record<string, any>): HttpParams {
  let httpParams = new HttpParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle array values
      if (Array.isArray(value)) {
        value.forEach(v => {
          httpParams = httpParams.append(key, String(v));
        });
      } else {
        // Convert to string
        httpParams = httpParams.set(key, String(value));
      }
    }
  });
  
  return httpParams;
}

/**
 * Build filter params for common filtering patterns
 */
export function buildFilterParams(filters: {
  page?: number;
  limit?: number;
  sort?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  [key: string]: any;
}): HttpParams {
  const params: Record<string, any> = {};
  
  if (filters['page']) params['page'] = filters['page'];
  if (filters['limit']) params['limit'] = filters['limit'];
  if (filters['sort']) params['sort'] = filters['sort'];
  if (filters['status']) params['status'] = filters['status'].toLowerCase();
  if (filters['startDate']) params['startDate'] = filters['startDate'];
  if (filters['endDate']) params['endDate'] = filters['endDate'];
  if (filters['search']) params['search'] = filters['search'];
  
  // Add any other custom filters
  Object.entries(filters).forEach(([key, value]) => {
    if (!['page', 'limit', 'sort', 'status', 'startDate', 'endDate', 'search'].includes(key) && value !== undefined) {
      params[key] = value;
    }
  });
  
  return buildHttpParams(params);
}

/**
 * Build date range params
 */
export function buildDateRangeParams(startDate?: string | Date, endDate?: string | Date): HttpParams {
  const params: Record<string, string> = {};
  
  if (startDate) {
    params['startDate'] = typeof startDate === 'string' ? startDate : startDate.toISOString();
  }
  if (endDate) {
    params['endDate'] = typeof endDate === 'string' ? endDate : endDate.toISOString();
  }
  
  return buildHttpParams(params);
}

/**
 * Build pagination params
 */
export function buildPaginationParams(page: number = 1, limit: number = 10, sort?: string): HttpParams {
  return buildHttpParams({ page, limit, ...(sort && { sort }) });
}


