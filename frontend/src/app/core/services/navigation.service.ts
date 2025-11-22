/**
 * Navigation Service
 * Manages application navigation with permission-based menu generation
 */

import { Injectable, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';
import { Permission } from '@shared/types/permissions';
import { UserRole } from '@shared/types';
import { getRoleDashboard } from '@shared/types/role-config';

export interface NavigationItem {
  label: string;
  route: string;
  icon: string;
  permission?: Permission;
  roles?: UserRole[];
  children?: NavigationItem[];
  badge?: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private router = inject(Router);

  /**
   * Main navigation menu
   */
  private mainNavigation: NavigationItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'My Timesheets',
      route: '/timesheets',
      icon: 'schedule',
      permission: Permission.CAN_SUBMIT_TIMESHEET
    },
    {
      label: 'My Leaves',
      route: '/leaves',
      icon: 'event_available',
      permission: Permission.CAN_REQUEST_LEAVE
    },
    {
      label: 'My Documents',
      route: '/documents',
      icon: 'folder',
      permission: Permission.CAN_UPLOAD_DOCUMENTS
    },
    {
      label: 'Approvals',
      route: '/approvals',
      icon: 'approval',
      permission: Permission.CAN_APPROVE_TEAM_TIMESHEET,
      children: [
        {
          label: 'Timesheet Approvals',
          route: '/approvals?tab=timesheets',
          icon: 'schedule',
          permission: Permission.CAN_APPROVE_TEAM_TIMESHEET
        },
        {
          label: 'Leave Approvals',
          route: '/approvals?tab=leaves',
          icon: 'event_available',
          permission: Permission.CAN_APPROVE_TEAM_LEAVE
        }
      ]
    },
    {
      label: 'Team',
      route: '/supervisor/team',
      icon: 'groups',
      permission: Permission.CAN_VIEW_TEAM_MEMBERS,
      children: [
        {
          label: 'Team Members',
          route: '/supervisor/team',
          icon: 'people',
          permission: Permission.CAN_VIEW_TEAM_MEMBERS
        },
        {
          label: 'Team Reports',
          route: '/supervisor/reports',
          icon: 'assessment',
          permission: Permission.CAN_VIEW_TEAM_REPORTS
        }
      ]
    },
    {
      label: 'HR',
      route: '/hr',
      icon: 'business_center',
      roles: [UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER],
      children: [
        {
          label: 'Employees',
          route: '/hr/employees',
          icon: 'people',
          permission: Permission.CAN_VIEW_ALL_EMPLOYEES
        },
        {
          label: 'All Documents',
          route: '/hr/documents',
          icon: 'folder_shared',
          permission: Permission.CAN_VIEW_ALL_DOCUMENTS
        }
      ]
    },
    {
      label: 'Admin',
      route: '/admin',
      icon: 'admin_panel_settings',
      roles: [UserRole.ADMIN, UserRole.EMPLOYER],
      children: [
        {
          label: 'User Management',
          route: '/admin/users',
          icon: 'manage_accounts',
          permission: Permission.CAN_CREATE_USERS
        },
        {
          label: 'Role Management',
          route: '/admin/roles',
          icon: 'assignment_ind',
          permission: Permission.CAN_MANAGE_ROLES
        },
        {
          label: 'System Settings',
          route: '/admin/settings',
          icon: 'settings',
          permission: Permission.CAN_MANAGE_SYSTEM_SETTINGS
        }
      ]
    },
    {
      label: 'Employer',
      route: '/employer',
      icon: 'business',
      roles: [UserRole.EMPLOYER],
      children: [
        {
          label: 'Workforce Overview',
          route: '/employer/workforce',
          icon: 'people_outline',
          permission: Permission.CAN_VIEW_ANALYTICS
        },
        {
          label: 'Financial Overview',
          route: '/employer/financial',
          icon: 'attach_money',
          permission: Permission.CAN_VIEW_FINANCIAL_REPORTS
        },
        {
          label: 'Analytics',
          route: '/employer/analytics',
          icon: 'analytics',
          permission: Permission.CAN_VIEW_ANALYTICS
        }
      ]
    },
    {
      label: 'Notifications',
      route: '/notifications',
      icon: 'notifications'
    },
    {
      label: 'Profile',
      route: '/profile',
      icon: 'person'
    }
  ];

  /**
   * Get filtered navigation based on user permissions
   */
  navigation = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    return this.filterNavigationItems(this.mainNavigation);
  });

  /**
   * Get user menu items
   */
  userMenu: NavigationItem[] = [
    {
      label: 'Profile',
      route: '/profile',
      icon: 'person'
    },
    {
      label: 'Settings',
      route: '/settings',
      icon: 'settings'
    }
  ];

  /**
   * Filter navigation items based on permissions and roles
   */
  private filterNavigationItems(items: NavigationItem[]): NavigationItem[] {
    const user = this.authService.currentUser();
    if (!user) return [];

    return items
      .filter(item => this.canAccessItem(item))
      .map(item => ({
        ...item,
        children: item.children 
          ? this.filterNavigationItems(item.children)
          : undefined
      }))
      .filter(item => !item.children || item.children.length > 0);
  }

  /**
   * Check if user can access navigation item
   */
  private canAccessItem(item: NavigationItem): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;

    // Check role-based access
    if (item.roles && item.roles.length > 0) {
      if (!item.roles.includes(user.role)) {
        return false;
      }
    }

    // Check permission-based access
    if (item.permission) {
      if (!this.permissionService.hasPermission(item.permission)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Navigate to user's dashboard
   */
  navigateToDashboard(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.router.navigate([getRoleDashboard(user.role)]);
    }
  }

  /**
   * Navigate to specific route
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Navigate back
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * Get breadcrumb for current route
   */
  getBreadcrumb(route: string): string[] {
    const segments = route.split('/').filter(s => s);
    return segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const item = this.findNavigationItem(this.mainNavigation, path);
      return item?.label || this.formatSegment(segment);
    });
  }

  /**
   * Find navigation item by route
   */
  private findNavigationItem(items: NavigationItem[], route: string): NavigationItem | undefined {
    for (const item of items) {
      if (item.route === route) {
        return item;
      }
      if (item.children) {
        const found = this.findNavigationItem(item.children, route);
        if (found) return found;
      }
    }
    return undefined;
  }

  /**
   * Format route segment for display
   */
  private formatSegment(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Check if route is active
   */
  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  /**
   * Get quick actions based on role
   */
  getQuickActions(): NavigationItem[] {
    const user = this.authService.currentUser();
    if (!user) return [];

    const quickActions: NavigationItem[] = [];

    // Employee quick actions
    if (this.permissionService.hasPermission(Permission.CAN_SUBMIT_TIMESHEET)) {
      quickActions.push({
        label: 'Add Timesheet',
        route: '/timesheets',
        icon: 'add_circle'
      });
    }

    if (this.permissionService.hasPermission(Permission.CAN_REQUEST_LEAVE)) {
      quickActions.push({
        label: 'Request Leave',
        route: '/leaves',
        icon: 'event_available'
      });
    }

    if (this.permissionService.hasPermission(Permission.CAN_UPLOAD_DOCUMENTS)) {
      quickActions.push({
        label: 'Upload Document',
        route: '/documents',
        icon: 'upload_file'
      });
    }

    // Admin quick actions
    if (this.permissionService.hasPermission(Permission.CAN_CREATE_USERS)) {
      quickActions.push({
        label: 'Create User',
        route: '/admin/users',
        icon: 'person_add'
      });
    }

    return quickActions;
  }
}


