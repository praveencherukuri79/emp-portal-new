/**
 * System Limits Configuration
 * Defines system-wide constraints and limits
 */

export const SYSTEM_LIMITS = {
  /**
   * File Upload Limits
   */
  FILE_UPLOAD: {
    /**
     * Maximum file size in megabytes
     */
    MAX_SIZE_MB: 10,
    
    /**
     * Maximum file size in bytes (calculated)
     */
    MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
    
    /**
     * Allowed image MIME types
     */
    ALLOWED_IMAGE_TYPES: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ] as const,
    
    /**
     * Allowed document MIME types
     */
    ALLOWED_DOCUMENT_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/plain',
      'text/csv',
    ] as const,
    
    /**
     * All allowed MIME types combined
     */
    get ALLOWED_TYPES() {
      return [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_DOCUMENT_TYPES];
    },
    
    /**
     * Allowed file extensions
     */
    ALLOWED_EXTENSIONS: [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', // Images
      '.pdf', // PDF
      '.doc', '.docx', // Word
      '.xls', '.xlsx', // Excel
      '.txt', '.csv', // Text
    ] as const,
    
    /**
     * Maximum avatar/profile image size in MB
     */
    MAX_AVATAR_SIZE_MB: 2,
    
    /**
     * Maximum avatar/profile image size in bytes
     */
    MAX_AVATAR_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
  },

  /**
   * Pagination Limits
   */
  PAGINATION: {
    /**
     * Default number of items per page
     */
    DEFAULT_PAGE_SIZE: 10,
    
    /**
     * Maximum number of items per page
     */
    MAX_PAGE_SIZE: 100,
    
    /**
     * Minimum number of items per page
     */
    MIN_PAGE_SIZE: 5,
    
    /**
     * Available page size options
     */
    AVAILABLE_PAGE_SIZES: [10, 25, 50, 100] as const,
    
    /**
     * Maximum pages to display in pagination component
     */
    MAX_PAGINATION_LINKS: 7,
  },

  /**
   * User & Authentication Limits
   */
  USERS: {
    /**
     * Maximum users per tenant (0 = unlimited)
     */
    MAX_USERS_PER_TENANT: 1000,
    
    /**
     * Minimum password length
     */
    PASSWORD_MIN_LENGTH: 8,
    
    /**
     * Maximum password length
     */
    PASSWORD_MAX_LENGTH: 128,
    
    /**
     * Maximum login attempts before lockout
     */
    MAX_LOGIN_ATTEMPTS: 5,
    
    /**
     * Lockout duration in minutes
     */
    LOCKOUT_DURATION_MINUTES: 15,
    
    /**
     * JWT access token expiration (seconds)
     */
    ACCESS_TOKEN_EXPIRY: 60 * 60, // 1 hour
    
    /**
     * JWT refresh token expiration (seconds)
     */
    REFRESH_TOKEN_EXPIRY: 60 * 60 * 24 * 7, // 7 days
    
    /**
     * Session timeout (minutes of inactivity)
     */
    SESSION_TIMEOUT_MINUTES: 30,
  },

  /**
   * Bulk Operations Limits
   */
  BULK_OPERATIONS: {
    /**
     * Maximum items in a single bulk operation
     */
    MAX_BATCH_SIZE: 100,
    
    /**
     * Maximum users to create in bulk
     */
    MAX_BULK_USER_CREATE: 50,
    
    /**
     * Maximum documents to upload in bulk
     */
    MAX_BULK_DOCUMENT_UPLOAD: 20,
    
    /**
     * Maximum approvals to process in bulk
     */
    MAX_BULK_APPROVALS: 100,
  },

  /**
   * Data Export Limits
   */
  EXPORT: {
    /**
     * Maximum records in CSV export
     */
    MAX_CSV_RECORDS: 10000,
    
    /**
     * Maximum records in Excel export
     */
    MAX_EXCEL_RECORDS: 10000,
    
    /**
     * Maximum records in PDF export
     */
    MAX_PDF_RECORDS: 1000,
    
    /**
     * Maximum file size for exports in MB
     */
    MAX_EXPORT_SIZE_MB: 50,
  },

  /**
   * Search & Filter Limits
   */
  SEARCH: {
    /**
     * Minimum search query length
     */
    MIN_SEARCH_LENGTH: 2,
    
    /**
     * Maximum search query length
     */
    MAX_SEARCH_LENGTH: 100,
    
    /**
     * Maximum search results
     */
    MAX_SEARCH_RESULTS: 100,
    
    /**
     * Search result cache duration (minutes)
     */
    SEARCH_CACHE_MINUTES: 5,
  },

  /**
   * API Rate Limits
   */
  API_RATE_LIMITS: {
    /**
     * Maximum requests per minute per user
     */
    REQUESTS_PER_MINUTE: 100,
    
    /**
     * Maximum requests per hour per user
     */
    REQUESTS_PER_HOUR: 1000,
    
    /**
     * Maximum requests per day per IP
     */
    REQUESTS_PER_DAY_PER_IP: 10000,
  },

  /**
   * Database Limits
   */
  DATABASE: {
    /**
     * Maximum concurrent database connections
     */
    MAX_POOL_SIZE: 50,
    
    /**
     * Query timeout in milliseconds
     */
    QUERY_TIMEOUT_MS: 30000, // 30 seconds
    
    /**
     * Maximum query result size in MB
     */
    MAX_QUERY_RESULT_SIZE_MB: 100,
  },

  /**
   * UI/UX Limits
   */
  UI: {
    /**
     * Maximum toast notifications to show at once
     */
    MAX_TOASTS: 3,
    
    /**
     * Toast notification duration in milliseconds
     */
    TOAST_DURATION_MS: 5000,
    
    /**
     * Maximum characters in text input fields
     */
    MAX_TEXT_INPUT_LENGTH: 255,
    
    /**
     * Maximum characters in textarea fields
     */
    MAX_TEXTAREA_LENGTH: 5000,
    
    /**
     * Maximum items in dropdown/select
     */
    MAX_DROPDOWN_ITEMS: 1000,
    
    /**
     * Debounce delay for search input (ms)
     */
    SEARCH_DEBOUNCE_MS: 300,
  },
} as const;

/**
 * Type for system limits (for type-safe access)
 */
export type SystemLimits = typeof SYSTEM_LIMITS;

/**
 * Validate file size
 * @param sizeInBytes File size in bytes
 * @param isAvatar Whether it's an avatar image
 * @returns True if valid
 */
export function isValidFileSize(sizeInBytes: number, isAvatar: boolean = false): boolean {
  const maxSize = isAvatar
    ? SYSTEM_LIMITS.FILE_UPLOAD.MAX_AVATAR_SIZE_BYTES
    : SYSTEM_LIMITS.FILE_UPLOAD.MAX_SIZE_BYTES;
  return sizeInBytes <= maxSize;
}

/**
 * Validate file type
 * @param mimeType MIME type to validate
 * @param category File category ('image' | 'document' | 'any')
 * @returns True if valid
 */
export function isValidFileType(
  mimeType: string,
  category: 'image' | 'document' | 'any' = 'any'
): boolean {
  if (category === 'image') {
    return SYSTEM_LIMITS.FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(mimeType as any);
  }
  if (category === 'document') {
    return SYSTEM_LIMITS.FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES.includes(mimeType as any);
  }
  return SYSTEM_LIMITS.FILE_UPLOAD.ALLOWED_TYPES.includes(mimeType as any);
}

/**
 * Format file size for display
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get max file size display string
 * @param isAvatar Whether it's for avatar
 * @returns Display string (e.g., "10 MB")
 */
export function getMaxFileSizeDisplay(isAvatar: boolean = false): string {
  const maxSizeMB = isAvatar
    ? SYSTEM_LIMITS.FILE_UPLOAD.MAX_AVATAR_SIZE_MB
    : SYSTEM_LIMITS.FILE_UPLOAD.MAX_SIZE_MB;
  return `${maxSizeMB} MB`;
}

