/**
 * Role Configuration
 * Defines role-specific form fields, labels, and UI behavior
 * Used by both Frontend and Backend
 */

import { UserRole } from './index';

// ==================== ROLE DISPLAY CONFIGURATION ====================

export interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  icon: string;
  dashboardRoute: string;
  requiresEmployeeDetails: boolean; // Whether this role needs employee-specific fields (department, designation, etc.)
  canSubmitOwnWork: boolean; // Whether this role can submit timesheets/leaves
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  [UserRole.PROSPECT]: {
    role: UserRole.PROSPECT,
    label: 'Prospect',
    description: 'Limited access - Profile completion only',
    icon: 'person_outline',
    dashboardRoute: '/prospect/dashboard',
    requiresEmployeeDetails: false,
    canSubmitOwnWork: false
  },
  [UserRole.EMPLOYEE]: {
    role: UserRole.EMPLOYEE,
    label: 'Employee',
    description: 'Standard workforce member - Can submit timesheets and leaves',
    icon: 'person',
    dashboardRoute: '/employee/dashboard',
    requiresEmployeeDetails: true,
    canSubmitOwnWork: true
  },
  [UserRole.SUPERVISOR]: {
    role: UserRole.SUPERVISOR,
    label: 'Supervisor',
    description: 'Team lead - Can approve team submissions',
    icon: 'supervisor_account',
    dashboardRoute: '/supervisor/dashboard',
    requiresEmployeeDetails: false,
    canSubmitOwnWork: true
  },
  [UserRole.HR]: {
    role: UserRole.HR,
    label: 'HR',
    description: 'Human Resources - Manage employees and documents',
    icon: 'business_center',
    dashboardRoute: '/hr/dashboard',
    requiresEmployeeDetails: false,
    canSubmitOwnWork: true
  },
  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    label: 'Admin',
    description: 'System Administrator - Manage users and settings',
    icon: 'admin_panel_settings',
    dashboardRoute: '/admin/dashboard',
    requiresEmployeeDetails: false,
    canSubmitOwnWork: true
  },
  [UserRole.EMPLOYER]: {
    role: UserRole.EMPLOYER,
    label: 'Employer',
    description: 'Organization Owner - Full access to analytics and reports',
    icon: 'business',
    dashboardRoute: '/employer/dashboard',
    requiresEmployeeDetails: false,
    canSubmitOwnWork: false
  }
};

// ==================== UTILITY FUNCTIONS ====================

export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLE_CONFIGS[role];
}

export function getRoleDashboard(role: UserRole): string {
  return ROLE_CONFIGS[role].dashboardRoute;
}

export function requiresEmployeeDetails(role: UserRole): boolean {
  return ROLE_CONFIGS[role].requiresEmployeeDetails;
}

export function canRoleSubmitOwnWork(role: UserRole): boolean {
  return ROLE_CONFIGS[role].canSubmitOwnWork;
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_CONFIGS[role].label;
}

export function getRoleIcon(role: UserRole): string {
  return ROLE_CONFIGS[role].icon;
}

// All available roles for dropdowns
export function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}

export function getAllRoleConfigs(): RoleConfig[] {
  return Object.values(ROLE_CONFIGS);
}

