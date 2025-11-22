/**
 * Frontend Formatters
 * Re-exports shared formatters and adds Angular-specific helpers
 */

export {
  formatStatus,
  formatLeaveType,
  formatDocumentCategory,
  formatEmploymentType,
  formatGender,
  formatRole,
  formatPriority,
  getStatusColor
} from '@shared/utils/formatters';

import {
  STATUS_LABELS,
  LEAVE_TYPE_LABELS,
  DOCUMENT_CATEGORY_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  GENDER_LABELS,
  ROLE_LABELS,
  PRIORITY_LABELS
} from '@shared/types/constants';

/**
 * Get status label for display in templates
 */
export function getStatusLabel(status: string, type: 'timesheet' | 'leave' | 'document' = 'timesheet'): string {
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
 * Get leave type label
 */
export function getLeaveTypeLabel(leaveType: string): string {
  return LEAVE_TYPE_LABELS[leaveType.toLowerCase() as keyof typeof LEAVE_TYPE_LABELS] || leaveType;
}

/**
 * Get document category label
 */
export function getDocumentCategoryLabel(category: string): string {
  return DOCUMENT_CATEGORY_LABELS[category.toLowerCase() as keyof typeof DOCUMENT_CATEGORY_LABELS] || category;
}

/**
 * Get employment type label
 */
export function getEmploymentTypeLabel(type: string): string {
  return EMPLOYMENT_TYPE_LABELS[type.toLowerCase() as keyof typeof EMPLOYMENT_TYPE_LABELS] || type;
}

/**
 * Get gender label
 */
export function getGenderLabel(gender: string): string {
  return GENDER_LABELS[gender.toLowerCase() as keyof typeof GENDER_LABELS] || gender;
}

/**
 * Get role label
 */
export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role.toLowerCase() as keyof typeof ROLE_LABELS] || role;
}

/**
 * Get priority label
 */
export function getPriorityLabel(priority: string): string {
  return PRIORITY_LABELS[priority.toLowerCase() as keyof typeof PRIORITY_LABELS] || priority;
}


