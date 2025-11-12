import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserRole } from '../../../core/models/user.model';
import { ROLE_LABELS } from '@shared/types/constants';

interface RolePermission {
  role: UserRole;
  label: string;
  description: string;
  permissions: string[];
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {
  loading = signal(false);
  roles: RolePermission[] = [];

  displayedColumns = ['role', 'description', 'permissions', 'actions'];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    // Simulate loading - in production, this would fetch from API
    setTimeout(() => {
      this.roles = [
        {
          role: UserRole.PROSPECT,
          label: ROLE_LABELS.PROSPECT,
          description: 'Prospective employees with limited access',
          permissions: ['View profile', 'Edit own profile']
        },
        {
          role: UserRole.EMPLOYEE,
          label: ROLE_LABELS.EMPLOYEE,
          description: 'Regular employees with standard access',
          permissions: ['View own timesheets', 'Submit timesheets', 'Request leaves', 'View own documents']
        },
        {
          role: UserRole.SUPERVISOR,
          label: ROLE_LABELS.SUPERVISOR,
          description: 'Team supervisors with approval capabilities',
          permissions: ['All employee permissions', 'Approve timesheets', 'Approve leaves', 'View team reports']
        },
        {
          role: UserRole.HR,
          label: ROLE_LABELS.HR,
          description: 'HR personnel with employee management access',
          permissions: ['All supervisor permissions', 'Manage employees', 'View all documents', 'Leave management']
        },
        {
          role: UserRole.ADMIN,
          label: ROLE_LABELS.ADMIN,
          description: 'System administrators with full access',
          permissions: ['All HR permissions', 'User management', 'Role assignment', 'System settings']
        },
        {
          role: UserRole.EMPLOYER,
          label: ROLE_LABELS.EMPLOYER,
          description: 'Employers with business insights and full control',
          permissions: ['All admin permissions', 'Financial reports', 'Business analytics', 'Workforce management']
        }
      ];
      this.loading.set(false);
    }, 500);
  }

  getRoleIcon(role: UserRole): string {
    const icons: Record<UserRole, string> = {
      [UserRole.PROSPECT]: 'person_outline',
      [UserRole.EMPLOYEE]: 'person',
      [UserRole.SUPERVISOR]: 'supervisor_account',
      [UserRole.HR]: 'business_center',
      [UserRole.ADMIN]: 'admin_panel_settings',
      [UserRole.EMPLOYER]: 'business'
    };
    return icons[role] || 'person';
  }
}
