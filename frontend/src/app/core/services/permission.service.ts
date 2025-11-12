import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { 
  Permission, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  getRolePermissions,
  FeatureGroups
} from '@shared/types/permissions';
import { UserRole } from '@shared/types';

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

  // Current user's role
  private currentRole = computed(() => this.authService.currentUser()?.role);

  // All permissions for current user
  permissions = computed(() => {
    const role = this.currentRole();
    return role ? getRolePermissions(role) : [];
  });

  /**
   * Check if current user has a specific permission
   */
  hasPermission(permission: Permission): boolean {
    return hasPermission(this.currentRole(), permission);
  }

  /**
   * Check if current user has ANY of the specified permissions
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return hasAnyPermission(this.currentRole(), permissions);
  }

  /**
   * Check if current user has ALL of the specified permissions
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return hasAllPermissions(this.currentRole(), permissions);
  }

  /**
   * Check if current user can access a feature group
   */
  canAccessFeatureGroup(group: keyof typeof FeatureGroups): boolean {
    return this.hasAllPermissions([...FeatureGroups[group]]);
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

  // ==================== DEBUG HELPER ====================
  
  /**
   * Get all permissions for debugging
   */
  getAllPermissions(): Permission[] {
    return this.permissions();
  }

  /**
   * Log current user's permissions (dev only)
   */
  logPermissions(): void {
    console.log('Current Role:', this.currentRole());
    console.log('Permissions:', this.permissions());
  }
}

