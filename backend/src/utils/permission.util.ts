/**
 * Permission Utility - Backend
 * Provides role-agnostic feature access checking
 * Controllers and middleware use this instead of checking roles directly
 */

import { UserRole } from '@shared/types';
import { 
  Permission, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  getRolePermissions
} from '@shared/types/permissions';

/**
 * Check if a user has a specific permission
 */
export function userHasPermission(userRole: UserRole | undefined, permission: Permission): boolean {
  return hasPermission(userRole, permission);
}

/**
 * Check if a user has ANY of the specified permissions
 */
export function userHasAnyPermission(userRole: UserRole | undefined, permissions: Permission[]): boolean {
  return hasAnyPermission(userRole, permissions);
}

/**
 * Check if a user has ALL of the specified permissions
 */
export function userHasAllPermissions(userRole: UserRole | undefined, permissions: Permission[]): boolean {
  return hasAllPermissions(userRole, permissions);
}

/**
 * Get all permissions for a role
 */
export function getUserPermissions(userRole: UserRole): Permission[] {
  return getRolePermissions(userRole);
}

// ==================== CONVENIENCE FUNCTIONS ====================

export const PermissionChecker = {
  // Document Permissions
  canUploadDocuments: (role: UserRole | undefined) => 
    hasPermission(role, Permission.CAN_UPLOAD_DOCUMENTS),
  
  canViewAllDocuments: (role: UserRole | undefined) => 
    hasPermission(role, Permission.CAN_VIEW_ALL_DOCUMENTS),
  
  canDeleteOwnDocuments: (role: UserRole | undefined) => 
    hasPermission(role, Permission.CAN_DELETE_OWN_DOCUMENTS),

  // Timesheet Permissions
  canSubmitTimesheet: (role: UserRole | undefined) => 
    hasPermission(role, Permission.CAN_SUBMIT_TIMESHEET),
  
  canApproveTimesheets: (role: UserRole | undefined) => 
    hasAnyPermission(role, [
      Permission.CAN_APPROVE_TEAM_TIMESHEET,
      Permission.CAN_APPROVE_ALL_TIMESHEET
    ]),

  // Leave Permissions
  canRequestLeave: (role: UserRole | undefined) => 
    hasPermission(role, Permission.CAN_REQUEST_LEAVE),
  
  canApproveLeaves: (role: UserRole | undefined) => 
    hasAnyPermission(role, [
      Permission.CAN_APPROVE_TEAM_LEAVE,
      Permission.CAN_APPROVE_ALL_LEAVE
    ]),

  // User Management
  canViewAllEmployees: (role: UserRole | undefined) => 
    hasPermission(role, Permission.CAN_VIEW_ALL_EMPLOYEES),
  
  canCreateUsers: (role: UserRole | undefined) => 
    hasPermission(role, Permission.CAN_CREATE_USERS),
  
  canEditUsers: (role: UserRole | undefined) => 
    hasPermission(role, Permission.CAN_EDIT_USERS),

  // System
  canManageSystemSettings: (role: UserRole | undefined) => 
    hasPermission(role, Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  
  canViewSystemHealth: (role: UserRole | undefined) => 
    hasPermission(role, Permission.CAN_VIEW_SYSTEM_HEALTH)
};

