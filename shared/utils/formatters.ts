/**
 * Shared Formatters and Helpers
 * Used by both Frontend and Backend for consistent formatting
 */

import {
  TimesheetStatus,
  LeaveStatus,
  LeaveType,
  DocumentCategory,
  NotificationPriority,
  EmploymentType,
  Gender,
  UserRole
} from '../types';
import {
  STATUS_LABELS,
  LEAVE_TYPE_LABELS,
  DOCUMENT_CATEGORY_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  GENDER_LABELS,
  ROLE_LABELS,
  PRIORITY_LABELS
} from '../types/constants';

/**
 * Format status for display
 */
export function formatStatus(status: string, type: 'timesheet' | 'leave' | 'document' = 'timesheet'): string {
  const statusLower = status.toLowerCase();
  
  if (type === 'timesheet') {
    return STATUS_LABELS.TIMESHEET[statusLower as keyof typeof STATUS_LABELS.TIMESHEET] || status;
  } else if (type === 'leave') {
    return STATUS_LABELS.LEAVE[statusLower as keyof typeof STATUS_LABELS.LEAVE] || status;
  } else {
    return STATUS_LABELS.DOCUMENT[statusLower as keyof typeof STATUS_LABELS.DOCUMENT] || status;
  }
}

/**
 * Format leave type for display
 */
export function formatLeaveType(leaveType: LeaveType | string): string {
  const typeUpper = leaveType.toUpperCase() as keyof typeof LEAVE_TYPE_LABELS;
  return LEAVE_TYPE_LABELS[typeUpper] || leaveType;
}

/**
 * Format document category for display
 */
export function formatDocumentCategory(category: DocumentCategory | string): string {
  const catUpper = category.toUpperCase() as keyof typeof DOCUMENT_CATEGORY_LABELS;
  return DOCUMENT_CATEGORY_LABELS[catUpper] || category;
}

/**
 * Format employment type for display
 */
export function formatEmploymentType(type: EmploymentType | string): string {
  // Convert 'full-time' to 'FULL_TIME' etc.
  const typeUpper = type.toUpperCase().replace('-', '_') as keyof typeof EMPLOYMENT_TYPE_LABELS;
  return EMPLOYMENT_TYPE_LABELS[typeUpper] || type;
}

/**
 * Format gender for display
 */
export function formatGender(gender: Gender | string): string {
  // Convert 'prefer-not-to-say' to 'PREFER_NOT_TO_SAY' etc.
  const genderUpper = gender.toUpperCase().replace(/-/g, '_') as keyof typeof GENDER_LABELS;
  return GENDER_LABELS[genderUpper] || gender;
}

/**
 * Format role for display
 */
export function formatRole(role: UserRole | string): string {
  const roleUpper = role.toUpperCase() as keyof typeof ROLE_LABELS;
  return ROLE_LABELS[roleUpper] || role;
}

/**
 * Format priority for display
 */
export function formatPriority(priority: NotificationPriority | string): string {
  const priorityUpper = priority.toUpperCase() as keyof typeof PRIORITY_LABELS;
  return PRIORITY_LABELS[priorityUpper] || priority;
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): 'primary' | 'accent' | 'warn' | '' {
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'approved' || statusLower === 'active') {
    return 'primary';
  } else if (statusLower === 'pending' || statusLower === 'submitted' || statusLower === 'draft') {
    return 'accent';
  } else if (statusLower === 'rejected' || statusLower === 'expired' || statusLower === 'cancelled') {
    return 'warn';
  }
  
  return '';
}

