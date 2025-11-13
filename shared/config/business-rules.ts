/**
 * Business Rules Configuration
 * Centralized business logic constants and rules
 */

export const BUSINESS_RULES = {
  /**
   * Leave Management Rules
   */
  LEAVE: {
    /**
     * Annual leave accrual rate per month
     * Default: 1.67 days/month (20 days/year)
     */
    ANNUAL_ACCRUAL_RATE: 1.67,
    
    /**
     * Maximum days that can be carried over to next year
     */
    MAX_CARRYOVER_DAYS: 10,
    
    /**
     * Sick leave days per year
     */
    SICK_LEAVE_PER_YEAR: 10,
    
    /**
     * Personal leave days per year
     */
    PERSONAL_LEAVE_PER_YEAR: 5,
    
    /**
     * Maternity leave days
     */
    MATERNITY_LEAVE_DAYS: 90,
    
    /**
     * Paternity leave days
     */
    PATERNITY_LEAVE_DAYS: 10,
    
    /**
     * Minimum notice days required for leave request
     */
    MIN_NOTICE_DAYS: 7,
    
    /**
     * Maximum consecutive days allowed for a single leave request
     */
    MAX_CONSECUTIVE_DAYS: 30,
    
    /**
     * Days before leave when cancellation is not allowed
     */
    CANCELLATION_CUTOFF_DAYS: 2,
  },

  /**
   * Timesheet Management Rules
   */
  TIMESHEET: {
    /**
     * Minimum hours per day entry
     */
    MIN_HOURS_PER_DAY: 0,
    
    /**
     * Maximum hours per day entry
     */
    MAX_HOURS_PER_DAY: 24,
    
    /**
     * Maximum hours per week
     */
    MAX_HOURS_PER_WEEK: 168,
    
    /**
     * Standard work hours per day
     */
    STANDARD_WORK_HOURS_PER_DAY: 8,
    
    /**
     * Standard work days per week
     */
    STANDARD_WORK_DAYS_PER_WEEK: 5,
    
    /**
     * Overtime threshold (hours per day)
     */
    OVERTIME_THRESHOLD_DAILY: 8,
    
    /**
     * Overtime threshold (hours per week)
     */
    OVERTIME_THRESHOLD_WEEKLY: 40,
    
    /**
     * Days in the past that timesheets can be edited
     */
    MAX_EDIT_DAYS_PAST: 30,
    
    /**
     * Days in the future that timesheets can be created
     */
    MAX_FUTURE_ENTRY_DAYS: 7,
  },

  /**
   * Document Management Rules
   */
  DOCUMENTS: {
    /**
     * Days before expiry to send warning notification
     */
    EXPIRY_WARNING_DAYS: 30,
    
    /**
     * Days after expiry to mark document as expired
     */
    EXPIRY_GRACE_PERIOD_DAYS: 0,
    
    /**
     * Maximum document retention period in days (optional)
     * 0 = no limit
     */
    MAX_RETENTION_DAYS: 0,
  },

  /**
   * Notification Rules
   */
  NOTIFICATIONS: {
    /**
     * Days to keep read notifications
     */
    READ_NOTIFICATION_RETENTION_DAYS: 30,
    
    /**
     * Days to keep unread notifications
     */
    UNREAD_NOTIFICATION_RETENTION_DAYS: 90,
    
    /**
     * Maximum notifications to display in dropdown
     */
    MAX_DROPDOWN_NOTIFICATIONS: 10,
  },

  /**
   * Employee Management Rules
   */
  EMPLOYEE: {
    /**
     * Probation period in days
     */
    PROBATION_PERIOD_DAYS: 90,
    
    /**
     * Notice period for resignation (days)
     */
    NOTICE_PERIOD_DAYS: 30,
    
    /**
     * Minimum age for employment
     */
    MIN_AGE: 18,
    
    /**
     * Maximum age for employment (0 = no limit)
     */
    MAX_AGE: 0,
  },

  /**
   * System Workflow Rules
   */
  WORKFLOWS: {
    /**
     * Auto-approval threshold for timesheets (0 = always requires approval)
     */
    TIMESHEET_AUTO_APPROVE_THRESHOLD: 0,
    
    /**
     * Auto-approval threshold for leaves (0 = always requires approval)
     */
    LEAVE_AUTO_APPROVE_THRESHOLD: 0,
    
    /**
     * Days after which pending approvals are escalated
     */
    APPROVAL_ESCALATION_DAYS: 7,
  },
} as const;

/**
 * Type for business rules (for type-safe access)
 */
export type BusinessRules = typeof BUSINESS_RULES;

/**
 * Get leave accrual rate for a specific period
 * @param months Number of months
 * @returns Number of days accrued
 */
export function calculateLeaveAccrual(months: number): number {
  return Number((months * BUSINESS_RULES.LEAVE.ANNUAL_ACCRUAL_RATE).toFixed(2));
}

/**
 * Check if overtime hours
 * @param hours Hours worked
 * @returns True if overtime
 */
export function isOvertime(hours: number): boolean {
  return hours > BUSINESS_RULES.TIMESHEET.OVERTIME_THRESHOLD_DAILY;
}

/**
 * Calculate overtime hours
 * @param hours Total hours worked
 * @returns Overtime hours
 */
export function calculateOvertimeHours(hours: number): number {
  const overtime = hours - BUSINESS_RULES.TIMESHEET.OVERTIME_THRESHOLD_DAILY;
  return overtime > 0 ? overtime : 0;
}

