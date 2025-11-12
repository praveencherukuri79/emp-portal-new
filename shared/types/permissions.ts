/**
 * Role-Based Permissions Configuration
 * Single source of truth for all role-based feature access
 * Used by both Frontend and Backend
 */

import { UserRole } from './index';

// ==================== FEATURE FLAGS ====================

export enum Permission {
  // Document Permissions
  CAN_UPLOAD_DOCUMENTS = 'CAN_UPLOAD_DOCUMENTS',
  CAN_VIEW_OWN_DOCUMENTS = 'CAN_VIEW_OWN_DOCUMENTS',
  CAN_VIEW_ALL_DOCUMENTS = 'CAN_VIEW_ALL_DOCUMENTS',
  CAN_DELETE_OWN_DOCUMENTS = 'CAN_DELETE_OWN_DOCUMENTS',
  CAN_DELETE_ANY_DOCUMENTS = 'CAN_DELETE_ANY_DOCUMENTS',
  
  // Timesheet Permissions
  CAN_SUBMIT_TIMESHEET = 'CAN_SUBMIT_TIMESHEET',
  CAN_EDIT_OWN_TIMESHEET = 'CAN_EDIT_OWN_TIMESHEET',
  CAN_APPROVE_TEAM_TIMESHEET = 'CAN_APPROVE_TEAM_TIMESHEET',
  CAN_APPROVE_ALL_TIMESHEET = 'CAN_APPROVE_ALL_TIMESHEET',
  CAN_VIEW_TEAM_TIMESHEET = 'CAN_VIEW_TEAM_TIMESHEET',
  
  // Leave Permissions
  CAN_REQUEST_LEAVE = 'CAN_REQUEST_LEAVE',
  CAN_EDIT_OWN_LEAVE = 'CAN_EDIT_OWN_LEAVE',
  CAN_APPROVE_TEAM_LEAVE = 'CAN_APPROVE_TEAM_LEAVE',
  CAN_APPROVE_ALL_LEAVE = 'CAN_APPROVE_ALL_LEAVE',
  CAN_MANAGE_LEAVE_POLICIES = 'CAN_MANAGE_LEAVE_POLICIES',
  
  // User Management Permissions
  CAN_VIEW_TEAM_MEMBERS = 'CAN_VIEW_TEAM_MEMBERS',
  CAN_VIEW_ALL_EMPLOYEES = 'CAN_VIEW_ALL_EMPLOYEES',
  CAN_CREATE_USERS = 'CAN_CREATE_USERS',
  CAN_EDIT_USERS = 'CAN_EDIT_USERS',
  CAN_DELETE_USERS = 'CAN_DELETE_USERS',
  CAN_MANAGE_ROLES = 'CAN_MANAGE_ROLES',
  
  // Dashboard & Reports
  CAN_VIEW_OWN_DASHBOARD = 'CAN_VIEW_OWN_DASHBOARD',
  CAN_VIEW_TEAM_REPORTS = 'CAN_VIEW_TEAM_REPORTS',
  CAN_VIEW_ORG_REPORTS = 'CAN_VIEW_ORG_REPORTS',
  CAN_VIEW_FINANCIAL_REPORTS = 'CAN_VIEW_FINANCIAL_REPORTS',
  CAN_VIEW_ANALYTICS = 'CAN_VIEW_ANALYTICS',
  
  // System Permissions
  CAN_MANAGE_SYSTEM_SETTINGS = 'CAN_MANAGE_SYSTEM_SETTINGS',
  CAN_VIEW_SYSTEM_HEALTH = 'CAN_VIEW_SYSTEM_HEALTH',
  CAN_MANAGE_ORGANIZATION = 'CAN_MANAGE_ORGANIZATION',
  
  // Profile Permissions
  CAN_EDIT_OWN_PROFILE = 'CAN_EDIT_OWN_PROFILE',
  CAN_COMPLETE_PROFILE = 'CAN_COMPLETE_PROFILE',
  
  // UI Display Permissions
  SHOW_ORG_WIDE_SUBTITLE = 'SHOW_ORG_WIDE_SUBTITLE',
  DEFAULT_TO_LEAVE_TAB = 'DEFAULT_TO_LEAVE_TAB'
}

// ==================== ROLE PERMISSIONS MAPPING ====================

// Define base permissions first
const PROSPECT_PERMISSIONS: Permission[] = [
  Permission.CAN_VIEW_OWN_DASHBOARD,
  Permission.CAN_EDIT_OWN_PROFILE,
  Permission.CAN_COMPLETE_PROFILE,
  Permission.CAN_VIEW_OWN_DOCUMENTS
];

const EMPLOYEE_PERMISSIONS: Permission[] = [
  ...PROSPECT_PERMISSIONS,
  Permission.CAN_UPLOAD_DOCUMENTS,
  Permission.CAN_DELETE_OWN_DOCUMENTS,
  Permission.CAN_SUBMIT_TIMESHEET,
  Permission.CAN_EDIT_OWN_TIMESHEET,
  Permission.CAN_REQUEST_LEAVE,
  Permission.CAN_EDIT_OWN_LEAVE
];

const SUPERVISOR_PERMISSIONS: Permission[] = [
  Permission.CAN_VIEW_OWN_DASHBOARD,
  Permission.CAN_EDIT_OWN_PROFILE,
  Permission.CAN_UPLOAD_DOCUMENTS,
  Permission.CAN_VIEW_OWN_DOCUMENTS,
  Permission.CAN_DELETE_OWN_DOCUMENTS,
  Permission.CAN_SUBMIT_TIMESHEET,
  Permission.CAN_EDIT_OWN_TIMESHEET,
  Permission.CAN_REQUEST_LEAVE,
  Permission.CAN_EDIT_OWN_LEAVE,
  Permission.CAN_VIEW_TEAM_MEMBERS,
  Permission.CAN_APPROVE_TEAM_TIMESHEET,
  Permission.CAN_APPROVE_TEAM_LEAVE,
  Permission.CAN_VIEW_TEAM_REPORTS,
  Permission.CAN_VIEW_TEAM_TIMESHEET
];

const HR_PERMISSIONS: Permission[] = [
  ...SUPERVISOR_PERMISSIONS,
  Permission.CAN_VIEW_ALL_EMPLOYEES,
  Permission.CAN_VIEW_ALL_DOCUMENTS,
  Permission.CAN_APPROVE_ALL_TIMESHEET,
  Permission.CAN_APPROVE_ALL_LEAVE,
  Permission.CAN_MANAGE_LEAVE_POLICIES,
  Permission.CAN_VIEW_ORG_REPORTS
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...HR_PERMISSIONS,
  Permission.CAN_CREATE_USERS,
  Permission.CAN_EDIT_USERS,
  Permission.CAN_DELETE_USERS,
  Permission.CAN_MANAGE_ROLES,
  Permission.CAN_MANAGE_SYSTEM_SETTINGS,
  Permission.CAN_VIEW_SYSTEM_HEALTH
];

const HR_PERMISSIONS_EXTENDED: Permission[] = [
  ...HR_PERMISSIONS,
  Permission.DEFAULT_TO_LEAVE_TAB
];

const ADMIN_PERMISSIONS_EXTENDED: Permission[] = [
  ...ADMIN_PERMISSIONS,
  Permission.DEFAULT_TO_LEAVE_TAB
];

const EMPLOYER_PERMISSIONS: Permission[] = [
  Permission.CAN_VIEW_OWN_DASHBOARD,
  Permission.CAN_EDIT_OWN_PROFILE,
  Permission.CAN_VIEW_TEAM_MEMBERS,
  Permission.CAN_APPROVE_TEAM_TIMESHEET,
  Permission.CAN_APPROVE_TEAM_LEAVE,
  Permission.CAN_VIEW_TEAM_REPORTS,
  Permission.CAN_VIEW_ALL_EMPLOYEES,
  Permission.CAN_VIEW_ALL_DOCUMENTS,
  Permission.CAN_APPROVE_ALL_TIMESHEET,
  Permission.CAN_APPROVE_ALL_LEAVE,
  Permission.CAN_VIEW_ORG_REPORTS,
  Permission.CAN_CREATE_USERS,
  Permission.CAN_EDIT_USERS,
  Permission.CAN_MANAGE_ROLES,
  Permission.CAN_MANAGE_SYSTEM_SETTINGS,
  Permission.CAN_VIEW_FINANCIAL_REPORTS,
  Permission.CAN_VIEW_ANALYTICS,
  Permission.CAN_MANAGE_ORGANIZATION,
  Permission.SHOW_ORG_WIDE_SUBTITLE
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.PROSPECT]: PROSPECT_PERMISSIONS,
  [UserRole.EMPLOYEE]: EMPLOYEE_PERMISSIONS,
  [UserRole.SUPERVISOR]: SUPERVISOR_PERMISSIONS,
  [UserRole.HR]: HR_PERMISSIONS_EXTENDED,
  [UserRole.ADMIN]: ADMIN_PERMISSIONS_EXTENDED,
  [UserRole.EMPLOYER]: EMPLOYER_PERMISSIONS
};

// ==================== PERMISSION UTILITIES ====================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role can access employee submission routes (Timesheets, Leaves, Documents)
 */
export function canAccessEmployeeRoutes(role: UserRole | undefined): boolean {
  return hasPermission(role, Permission.CAN_SUBMIT_TIMESHEET);
}

/**
 * Check if role can access management/approval routes
 */
export function canAccessApprovalRoutes(role: UserRole | undefined): boolean {
  return hasAnyPermission(role, [
    Permission.CAN_APPROVE_TEAM_TIMESHEET,
    Permission.CAN_APPROVE_ALL_TIMESHEET,
    Permission.CAN_APPROVE_TEAM_LEAVE,
    Permission.CAN_APPROVE_ALL_LEAVE
  ]);
}

/**
 * Check if role can access admin routes
 */
export function canAccessAdminRoutes(role: UserRole | undefined): boolean {
  return hasPermission(role, Permission.CAN_CREATE_USERS);
}

// ==================== FEATURE GROUPS ====================

/**
 * Group related permissions for easier checking
 */
export const FeatureGroups = {
  DOCUMENT_MANAGEMENT: [Permission.CAN_VIEW_ALL_DOCUMENTS, Permission.CAN_VIEW_ALL_EMPLOYEES],
  LEAVE_MANAGEMENT: [Permission.CAN_APPROVE_ALL_LEAVE, Permission.CAN_MANAGE_LEAVE_POLICIES],
  USER_MANAGEMENT: [Permission.CAN_CREATE_USERS, Permission.CAN_EDIT_USERS, Permission.CAN_MANAGE_ROLES],
  TEAM_MANAGEMENT: [Permission.CAN_VIEW_TEAM_MEMBERS, Permission.CAN_APPROVE_TEAM_TIMESHEET, Permission.CAN_APPROVE_TEAM_LEAVE],
  ANALYTICS: [Permission.CAN_VIEW_FINANCIAL_REPORTS, Permission.CAN_VIEW_ANALYTICS, Permission.CAN_VIEW_ORG_REPORTS]
} as const;

