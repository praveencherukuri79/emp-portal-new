/**
 * DTO (Data Transfer Object) Utilities
 * For transforming and sanitizing data
 */

/**
 * Exclude specified fields from an object
 */
export function exclude<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * Pick only specified fields from an object
 */
export function pick<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if ((obj as any)[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Remove sensitive fields from user object
 */
export function sanitizeUser(user: any) {
  return exclude(user, ['password', 'refreshToken', '__v']);
}

/**
 * Transform Mongoose document to plain object without sensitive data
 */
export function toDTO<T>(doc: any, excludeFields: string[] = []): T {
  if (!doc) return doc;
  
  const obj = doc.toJSON ? doc.toJSON() : doc;
  const defaultExclude = ['__v'];
  const allExclude = [...defaultExclude, ...excludeFields];
  
  return exclude(obj, allExclude as any) as T;
}

/**
 * Transform array of Mongoose documents to DTOs
 */
export function toDTOArray<T>(docs: any[], excludeFields: string[] = []): T[] {
  return docs.map(doc => toDTO<T>(doc, excludeFields));
}

/**
 * Sanitize pagination params
 */
export function sanitizePaginationParams(query: any): { page: number; limit: number } {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  return { page, limit };
}

/**
 * Parse sort string to Mongoose sort object
 */
export function parseSortString(sortStr: string): Record<string, 1 | -1> {
  if (!sortStr) return {};
  
  const sort: Record<string, 1 | -1> = {};
  sortStr.split(',').forEach(field => {
    if (field.startsWith('-')) {
      sort[field.substring(1)] = -1;
    } else {
      sort[field] = 1;
    }
  });
  
  return sort;
}

/**
 * Build date range filter
 */
export function buildDateRangeFilter(startDate?: string, endDate?: string) {
  const filter: any = {};
  
  if (startDate) {
    filter.$gte = new Date(startDate);
  }
  
  if (endDate) {
    filter.$lte = new Date(endDate);
  }
  
  return Object.keys(filter).length > 0 ? filter : null;
}

/**
 * Clean undefined values from object
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null) {
      cleaned[key] = obj[key];
    }
  });
  
  return cleaned;
}

/**
 * Convert string to boolean
 */
export function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}

/**
 * Parse array from query string
 */
export function parseArray(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(v => v.trim());
  return [];
}
