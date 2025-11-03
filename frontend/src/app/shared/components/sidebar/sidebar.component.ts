import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  collapsed = signal(false);
  currentUser = computed(() => this.authService.currentUser());

  navItems: NavItem[] = [
    // Prospect Navigation
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/prospect/dashboard',
      roles: [UserRole.PROSPECT]
    },
    
    // Employee Navigation
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/employee/dashboard',
      roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'Timesheets',
      icon: 'schedule',
      route: '/employee/timesheets',
      roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'Leave Requests',
      icon: 'event_available',
      route: '/employee/leaves',
      roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'Documents',
      icon: 'folder',
      route: '/employee/documents',
      roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    
    // Supervisor Navigation
    {
      label: 'Supervisor Dashboard',
      icon: 'supervisor_account',
      route: '/supervisor/dashboard',
      roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'Approvals',
      icon: 'approval',
      route: '/supervisor/approvals',
      roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'Team Management',
      icon: 'groups',
      route: '/supervisor/team',
      roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    
    // HR Navigation
    {
      label: 'HR Dashboard',
      icon: 'business_center',
      route: '/hr/dashboard',
      roles: [UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'Employee Management',
      icon: 'people',
      route: '/hr/employees',
      roles: [UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'Leave Management',
      icon: 'event_available',
      route: '/hr/leaves',
      roles: [UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'Document Compliance',
      icon: 'folder_special',
      route: '/hr/documents',
      roles: [UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    
    // Admin Navigation
    {
      label: 'Admin Dashboard',
      icon: 'admin_panel_settings',
      route: '/admin/dashboard',
      roles: [UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'User Management',
      icon: 'manage_accounts',
      route: '/admin/users',
      roles: [UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'Role Management',
      icon: 'shield',
      route: '/admin/roles',
      roles: [UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'System Settings',
      icon: 'settings',
      route: '/admin/settings',
      roles: [UserRole.ADMIN, UserRole.EMPLOYER]
    },
    
    // Employer Navigation
    {
      label: 'Executive Dashboard',
      icon: 'insights',
      route: '/employer/dashboard',
      roles: [UserRole.EMPLOYER]
    },
    {
      label: 'Financial Reports',
      icon: 'attach_money',
      route: '/employer/financial',
      roles: [UserRole.EMPLOYER]
    },
    {
      label: 'Business Analytics',
      icon: 'analytics',
      route: '/employer/analytics',
      roles: [UserRole.EMPLOYER]
    },
    {
      label: 'Workforce Management',
      icon: 'work',
      route: '/employer/workforce',
      roles: [UserRole.EMPLOYER]
    }
  ];

  constructor(private authService: AuthService) {}

  toggleSidebar() {
    this.collapsed.update(value => !value);
  }

  hasAccess(roles: UserRole[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return roles.includes(user.role as UserRole);
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
