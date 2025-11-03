import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  children?: NavItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  sidenavOpened = signal(true);
  currentUser = computed(() => this.authService.currentUser());
  notificationCount = signal(5);

  navItems: NavItem[] = [
    // Dashboard - All roles
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '',
      roles: [UserRole.PROSPECT, UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    
    // Employee Features
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
      label: 'My Documents',
      icon: 'folder',
      route: '/employee/documents',
      roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    
    // Supervisor Features
    {
      label: 'Team Management',
      icon: 'groups',
      route: '/supervisor/team',
      roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER],
      children: [
        {
          label: 'Approvals',
          icon: 'approval',
          route: '/supervisor/approvals',
          roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
        },
        {
          label: 'Team Reports',
          icon: 'assessment',
          route: '/supervisor/reports',
          roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
        }
      ]
    },
    
    // HR Features
    {
      label: 'HR Management',
      icon: 'business_center',
      route: '/hr',
      roles: [UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER],
      children: [
        {
          label: 'Employees',
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
          label: 'Documents',
          icon: 'folder_special',
          route: '/hr/documents',
          roles: [UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
        }
      ]
    },
    
    // Admin Features
    {
      label: 'Administration',
      icon: 'admin_panel_settings',
      route: '/admin',
      roles: [UserRole.ADMIN, UserRole.EMPLOYER],
      children: [
        {
          label: 'Users',
          icon: 'manage_accounts',
          route: '/admin/users',
          roles: [UserRole.ADMIN, UserRole.EMPLOYER]
        },
        {
          label: 'Roles',
          icon: 'shield',
          route: '/admin/roles',
          roles: [UserRole.ADMIN, UserRole.EMPLOYER]
        },
        {
          label: 'Settings',
          icon: 'settings',
          route: '/admin/settings',
          roles: [UserRole.ADMIN, UserRole.EMPLOYER]
        }
      ]
    },
    
    // Employer Features
    {
      label: 'Business Intelligence',
      icon: 'insights',
      route: '/employer',
      roles: [UserRole.EMPLOYER],
      children: [
        {
          label: 'Financial Reports',
          icon: 'attach_money',
          route: '/employer/financial',
          roles: [UserRole.EMPLOYER]
        },
        {
          label: 'Analytics',
          icon: 'analytics',
          route: '/employer/analytics',
          roles: [UserRole.EMPLOYER]
        },
        {
          label: 'Workforce',
          icon: 'work',
          route: '/employer/workforce',
          roles: [UserRole.EMPLOYER]
        }
      ]
    }
  ];

  constructor(private authService: AuthService) {}

  toggleSidenav(): void {
    this.sidenavOpened.update(value => !value);
  }

  hasAccess(roles: UserRole[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  getVisibleNavItems(): NavItem[] {
    return this.navItems.filter(item => this.hasAccess(item.roles));
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getRoleName(): string {
    const user = this.currentUser();
    if (!user) return '';
    return user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
  }
}
