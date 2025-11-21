import { Injectable, inject, Signal } from '@angular/core';
import { AuthService } from './auth.service';
import { 
  Permission,
  FeatureGroups
} from '@shared/types/permissions';

/**
 * Permission Service - Frontend
 * Provides role-agnostic feature access checking
 * Components use this instead of checking roles directly
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private authService = inject(AuthService);

  // Get cached permissions from AuthService (loaded once at login)
  private userPermissions: Signal<Permission[]> = this.authService.userPermissions;

  /**
   * Check if current user has a specific permission
   * Uses cached permissions loaded at login for optimal performance
   */
  hasPermission(permission: Permission): boolean {
    const permissions = this.userPermissions();
    return permissions.includes(permission);
  }

  /**
   * Check if current user has ANY of the specified permissions
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    const userPerms = this.userPermissions();
    return permissions.some(p => userPerms.includes(p));
  }

  /**
   * Check if current user has ALL of the specified permissions
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    const userPerms = this.userPermissions();
    return permissions.every(p => userPerms.includes(p));
  }

  /**
   * Check if current user can access a feature group
   */
  canAccessFeatureGroup(group: keyof typeof FeatureGroups): boolean {
    const permissions = FeatureGroups[group] as readonly Permission[];
    return this.hasAllPermissions([...permissions]);
  }

  // ==================== CONVENIENCE METHODS ====================

  // Document Features
  canUploadDocuments(): boolean {
    return this.hasPermission(Permission.CAN_UPLOAD_DOCUMENTS);
  }

  canViewAllDocuments(): boolean {
    return this.hasPermission(Permission.CAN_VIEW_ALL_DOCUMENTS);
  }

  canDeleteOwnDocuments(): boolean {
    return this.hasPermission(Permission.CAN_DELETE_OWN_DOCUMENTS);
  }

  // Timesheet Features
  canSubmitTimesheet(): boolean {
    return this.hasPermission(Permission.CAN_SUBMIT_TIMESHEET);
  }

  canApproveTimesheets(): boolean {
    return this.hasAnyPermission([
      Permission.CAN_APPROVE_TEAM_TIMESHEET,
      Permission.CAN_APPROVE_ALL_TIMESHEET
    ]);
  }

  // Leave Features
  canRequestLeave(): boolean {
    return this.hasPermission(Permission.CAN_REQUEST_LEAVE);
  }

  canApproveLeaves(): boolean {
    return this.hasAnyPermission([
      Permission.CAN_APPROVE_TEAM_LEAVE,
      Permission.CAN_APPROVE_ALL_LEAVE
    ]);
  }

  canManageLeavePolicies(): boolean {
    return this.hasPermission(Permission.CAN_MANAGE_LEAVE_POLICIES);
  }

  // User Management Features
  canViewAllEmployees(): boolean {
    return this.hasPermission(Permission.CAN_VIEW_ALL_EMPLOYEES);
  }

  canCreateUsers(): boolean {
    return this.hasPermission(Permission.CAN_CREATE_USERS);
  }

  canEditUsers(): boolean {
    return this.hasPermission(Permission.CAN_EDIT_USERS);
  }

  canManageRoles(): boolean {
    return this.hasPermission(Permission.CAN_MANAGE_ROLES);
  }

  // Reports & Analytics
  canViewTeamReports(): boolean {
    return this.hasPermission(Permission.CAN_VIEW_TEAM_REPORTS);
  }

  canViewOrgReports(): boolean {
    return this.hasPermission(Permission.CAN_VIEW_ORG_REPORTS);
  }

  canViewFinancialReports(): boolean {
    return this.hasPermission(Permission.CAN_VIEW_FINANCIAL_REPORTS);
  }

  canViewAnalytics(): boolean {
    return this.hasPermission(Permission.CAN_VIEW_ANALYTICS);
  }

  // System Features
  canManageSystemSettings(): boolean {
    return this.hasPermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS);
  }

  canViewSystemHealth(): boolean {
    return this.hasPermission(Permission.CAN_VIEW_SYSTEM_HEALTH);
  }

  // UI Display Permissions
  shouldShowOrgWideSubtitle(): boolean {
    return this.hasPermission(Permission.SHOW_ORG_WIDE_SUBTITLE);
  }

  shouldDefaultToLeaveTab(): boolean {
    return this.hasPermission(Permission.DEFAULT_TO_LEAVE_TAB);
  }

  // ==================== UTILITY METHODS ====================
  
  /**
   * Get all permissions for the current user
   * Useful for debugging and displaying in UI
   */
  getAllPermissions(): Permission[] {
    return this.userPermissions();
  }
  
  /**
   * Get the role configuration for the current user
   */
  getRoleConfig() {
    return this.authService.roleConfig();
  }

  /**
   * Log current user's permissions (dev/debug only)
   * Note: Only use in development mode
   */
  logPermissions(): void {
    if (typeof window !== 'undefined' && (window as any)['DEBUG_MODE']) {
      // Debug logging can be enabled by setting window.DEBUG_MODE = true
    }
  }
}

