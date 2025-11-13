/**
 * Shared Validation Types and Constants
 * Used by both Frontend and Backend
 */

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '!@#$%^&*(),.?":{}|<>'
} as const;

// Field length constraints
export const FIELD_LENGTHS = {
  NAME: { min: 2, max: 50 },
  EMAIL: { min: 5, max: 255 },
  PHONE: { min: 10, max: 20 },
  DESCRIPTION: { min: 10, max: 500 },
  REASON: { min: 10, max: 500 },
  PROJECT_NAME: { min: 2, max: 100 },
  TASK_NAME: { min: 2, max: 100 },
  DESIGNATION: { min: 2, max: 100 },
  DEPARTMENT: { min: 2, max: 100 },
  EMPLOYEE_ID: { min: 3, max: 20 },
  DOCUMENT_NUMBER: { min: 3, max: 50 }
} as const;

// Numeric ranges
export const NUMERIC_RANGES = {
  TIMESHEET_HOURS: { min: 0.5, max: 24 },
  LEAVE_DAYS: { min: 0.5, max: 365 },
  AGE: { min: 18, max: 100 },
  SALARY: { min: 0, max: 10000000 }
} as const;

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    'image/webp'
  ]
} as const;

// Regex patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\+\(\)]{10,20}$/,
  EMPLOYEE_ID: /^[A-Z]{2,5}\d{4,6}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_SPACE: /^[a-zA-Z0-9\s]+$/,
  URL: /^https?:\/\/.+/,
  MONGODB_OBJECTID: /^[a-f\d]{24}$/i
} as const;

// Date constraints
export const DATE_CONSTRAINTS = {
  MIN_AGE_YEARS: 18,
  MAX_AGE_YEARS: 100,
  EXPIRY_WARNING_DAYS: [30, 15, 7],
  MAX_LEAVE_DAYS_PER_REQUEST: 30,
  MAX_BACKDATE_DAYS: 7
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_SORT: 'createdAt',
  DEFAULT_ORDER: 'desc' as const
} as const;

// Error messages
export const VALIDATION_ERRORS = {
  REQUIRED: (field: string) => `${field} is required`,
  INVALID_FORMAT: (field: string) => `${field} has invalid format`,
  TOO_SHORT: (field: string, min: number) => `${field} must be at least ${min} characters`,
  TOO_LONG: (field: string, max: number) => `${field} must not exceed ${max} characters`,
  OUT_OF_RANGE: (field: string, min: number, max: number) => 
    `${field} must be between ${min} and ${max}`,
  INVALID_EMAIL: 'Invalid email address',
  WEAK_PASSWORD: 'Password does not meet strength requirements',
  PASSWORDS_MISMATCH: 'Passwords do not match',
  INVALID_DATE_RANGE: 'End date must be after start date',
  FILE_TOO_LARGE: (maxSizeMB: number) => `File size must not exceed ${maxSizeMB}MB`,
  INVALID_FILE_TYPE: (allowed: string[]) => `File type not allowed. Allowed types: ${allowed.join(', ')}`,
  PAST_DATE_REQUIRED: 'Date must be in the past',
  FUTURE_DATE_REQUIRED: 'Date must be in the future'
} as const;

