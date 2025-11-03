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
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      roles: [UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE]
    },
    {
      label: 'Timesheets',
      icon: 'schedule',
      route: '/timesheets',
      roles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN]
    },
    {
      label: 'Leave Requests',
      icon: 'event_available',
      route: '/leaves',
      roles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN]
    },
    {
      label: 'Documents',
      icon: 'folder',
      route: '/documents',
      roles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN]
    },
    {
      label: 'Approvals',
      icon: 'approval',
      route: '/approvals',
      roles: [UserRole.MANAGER, UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN]
    },
    {
      label: 'Employees',
      icon: 'people',
      route: '/employees',
      roles: [UserRole.MANAGER, UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN]
    },
    {
      label: 'Reports',
      icon: 'assessment',
      route: '/reports',
      roles: [UserRole.MANAGER, UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN]
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
      roles: [UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN]
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
