/**
 * Shared Constants
 * Used by both Frontend and Backend
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    ME: '/auth/me'
  },
  USERS: {
    PROFILE: '/users/profile',
    ALL: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    TEAM: '/users/team',
    EMPLOYEE_INFO: (id: string) => `/users/${id}/employee-info`,
    ROLE: (id: string) => `/users/${id}/role`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`
  },
  TIMESHEETS: {
    ENTRIES: '/timesheets/entries',
    BATCH_ENTRIES: '/timesheets/entries/batch',
    WEEK: (date: string) => `/timesheets/week/${date}`,
    ENTRY: (id: string) => `/timesheets/entries/${id}`,
    SUBMIT: '/timesheets/submit',
    HISTORY: '/timesheets/history',
    PENDING_APPROVALS: '/timesheets/approvals/pending',
    APPROVE: '/timesheets/approvals/approve',
    REJECT: '/timesheets/approvals/reject'
  },
  LEAVES: {
    CREATE: '/leaves',
    MY_REQUESTS: '/leaves/my-requests',
    MY_BALANCE: '/leaves/my-balance',
    CALENDAR: '/leaves/calendar',
    BY_ID: (id: string) => `/leaves/${id}`,
    CANCEL: (id: string) => `/leaves/${id}/cancel`,
    PENDING_APPROVALS: '/leaves/approvals/pending',
    APPROVE: (id: string) => `/leaves/${id}/approve`,
    REJECT: (id: string) => `/leaves/${id}/reject`,
    STATISTICS: '/leaves/statistics'
  },
  DOCUMENTS: {
    UPLOAD: '/documents/upload',
    MY_DOCUMENTS: '/documents/my-documents',
    SHARED: '/documents/shared',
    EXPIRING: '/documents/expiring',
    ALL: '/documents',
    BY_ID: (id: string) => `/documents/${id}`,
    SHARE: (id: string) => `/documents/${id}/share`,
    DOWNLOAD: (id: string) => `/documents/${id}/download`
  },
  NOTIFICATIONS: {
    ALL: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`
  },
  DASHBOARD: {
    BASE: '/dashboard'
  },
  REPORTS: {
    TIMESHEET: '/reports/timesheet',
    LEAVE: '/reports/leave',
    TEAM: '/reports/team'
  },
  ADMIN: {
    CREATE_USER: '/admin/create-user',
    BULK_CREATE_USERS: '/admin/bulk-create-users',
    TENANT: '/admin/tenant'
  },
  PROJECTS: {
    ALL: '/projects'
  }
} as const;

// Default Values
export const DEFAULT_VALUES = {
  PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
    MAX_LIMIT: 100
  },
  LEAVE_BALANCE: {
    ANNUAL: 20,
    SICK: 10,
    PERSONAL: 5,
    UNPAID: 0,
    MATERNITY: 0,
    PATERNITY: 0
  },
  NOTIFICATION: {
    DURATION_SUCCESS: 3000,
    DURATION_ERROR: 5000,
    DURATION_WARNING: 4000,
    DURATION_INFO: 3000
  },
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss'
} as const;

// Status Labels (for UI display)
export const STATUS_LABELS = {
  TIMESHEET: {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    APPROVED: 'Approved',
    REJECTED: 'Rejected'
  },
  LEAVE: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled'
  },
  DOCUMENT: {
    ACTIVE: 'Active',
    EXPIRED: 'Expired',
    EXPIRING_SOON: 'Expiring Soon'
  }
} as const;

// Priority Labels
export const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
} as const;

// Leave Type Labels
export const LEAVE_TYPE_LABELS = {
  ANNUAL: 'Annual Leave',
  SICK: 'Sick Leave',
  PERSONAL: 'Personal Leave',
  UNPAID: 'Unpaid Leave',
  MATERNITY: 'Maternity Leave',
  PATERNITY: 'Paternity Leave'
} as const;

// Document Category Labels
export const DOCUMENT_CATEGORY_LABELS = {
  VISA: 'Visa',
  PASSPORT: 'Passport',
  CONTRACT: 'Contract',
  CERTIFICATION: 'Certification',
  TAX: 'Tax Document',
  INSURANCE: 'Insurance',
  OTHER: 'Other'
} as const;

// Employment Type Labels
export const EMPLOYMENT_TYPE_LABELS = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERN: 'Intern'
} as const;

// Gender Labels
export const GENDER_LABELS = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say'
} as const;

// Role Labels
export const ROLE_LABELS = {
  PROSPECT: 'Prospect',
  EMPLOYEE: 'Employee',
  SUPERVISOR: 'Supervisor',
  HR: 'HR',
  ADMIN: 'Admin',
  EMPLOYER: 'Employer'
} as const;

