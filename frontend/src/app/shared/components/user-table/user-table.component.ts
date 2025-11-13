import { Component, Input, Output, EventEmitter, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import dayjs from 'dayjs';
import { PermissionService } from '../../../core/services/permission.service';
import { User, UserRole } from '../../../core/models/user.model';
import { IEmployerWorkforceEmployee } from '@shared/types';
import { ROLE_LABELS, EMPLOYMENT_TYPE_LABELS } from '@shared/types/constants';
import {
  UserTableColumn,
  UserTablePermissions,
  UserTableAction,
  UserTableData,
  UserTableColumnId
} from './user-table.types';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent implements OnInit {
  private permissionService = inject(PermissionService);

  // Configuration Inputs
  @Input() columns: UserTableColumn[] = [];
  @Input() dataSource: UserTableData[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No users found';
  @Input() permissions: UserTablePermissions = {};
  @Input() autoConfigurePermissions = true;

  // Action Outputs
  @Output() view = new EventEmitter<UserTableAction>();
  @Output() edit = new EventEmitter<UserTableAction>();
  @Output() delete = new EventEmitter<UserTableAction>();
  @Output() statusToggle = new EventEmitter<UserTableAction>();
  @Output() roleChange = new EventEmitter<UserTableAction>();

  // Computed values
  displayedColumns = computed(() => 
    this.columns.filter(col => col.visible).map(col => col.id)
  );

  // Constants
  UserTableColumnId = UserTableColumnId;
  roleLabels = ROLE_LABELS;

  ngOnInit(): void {
    if (this.autoConfigurePermissions) {
      this.configurePermissions();
    }
  }

  /**
   * Auto-configure permissions based on user's role
   */
  private configurePermissions(): void {
    // Only set if not explicitly provided
    if (this.permissions.canView === undefined) {
      this.permissions.canView = this.permissionService.canViewAllEmployees();
    }
    if (this.permissions.canEdit === undefined) {
      this.permissions.canEdit = this.permissionService.canEditUsers();
    }
    if (this.permissions.canDelete === undefined) {
      this.permissions.canDelete = false; // Conservative default
    }
    if (this.permissions.canChangeRole === undefined) {
      this.permissions.canChangeRole = this.permissionService.canManageRoles();
    }
    if (this.permissions.canToggleStatus === undefined) {
      this.permissions.canToggleStatus = this.permissionService.canEditUsers();
    }
    if (this.permissions.canCreate === undefined) {
      this.permissions.canCreate = this.permissionService.canCreateUsers();
    }
  }

  /**
   * Get display name for user
   */
  getDisplayName(user: any): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.fullName || user.name || 'Unknown';
  }

  /**
   * Get email for user
   */
  getEmail(user: any): string {
    return user.email || 'N/A';
  }

  /**
   * Get employee ID
   */
  getEmployeeId(user: any): string {
    return user.employeeId || 'N/A';
  }

  /**
   * Get role display label
   */
  getRoleLabel(user: any): string {
    const role = user.role;
    if (!role) return 'N/A';
    const key = role.toUpperCase() as keyof typeof ROLE_LABELS;
    return this.roleLabels[key] || role;
  }

  /**
   * Get department display name
   */
  getDepartment(user: any): string {
    if (user.department) {
      return typeof user.department === 'string' ? user.department : user.department.name;
    }
    return user.departmentName || 'Unassigned';
  }

  /**
   * Get employment type display label
   */
  getEmploymentType(user: any): string {
    const type = user.employmentType;
    if (!type) return 'N/A';
    const key = type.replace(/-/, '_').toUpperCase() as keyof typeof EMPLOYMENT_TYPE_LABELS;
    return EMPLOYMENT_TYPE_LABELS[key] || type;
  }

  /**
   * Calculate and format tenure
   */
  getTenure(user: any): string {
    const joiningDate = user.joiningDate || user.startDate;
    if (!joiningDate) return 'N/A';

    const start = dayjs(joiningDate);
    if (!start.isValid()) return 'N/A';

    const months = dayjs().diff(start, 'month');
    if (months <= 0) return '< 1 mo';
    if (months < 12) return `${months} mo`;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
      return `${years} yr${years > 1 ? 's' : ''}`;
    }
    return `${years} yr ${remainingMonths} mo`;
  }

  /**
   * Get status display
   */
  getStatus(user: any): string {
    return user.isActive ? 'Active' : 'Inactive';
  }

  /**
   * Get status chip color
   */
  getStatusColor(user: any): string {
    return user.isActive ? 'primary' : 'warn';
  }

  /**
   * Get initials for avatar
   */
  getInitials(user: any): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    const name = user.fullName || user.name || 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  /**
   * Handle view action
   */
  onView(user: UserTableData): void {
    this.view.emit({ action: 'view', user });
  }

  /**
   * Handle edit action
   */
  onEdit(user: UserTableData): void {
    this.edit.emit({ action: 'edit', user });
  }

  /**
   * Handle delete action
   */
  onDelete(user: UserTableData): void {
    this.delete.emit({ action: 'delete', user });
  }

  /**
   * Handle status toggle action
   */
  onStatusToggle(user: UserTableData): void {
    this.statusToggle.emit({ action: 'statusToggle', user });
  }

  /**
   * Handle role change action
   */
  onRoleChange(user: UserTableData, newRole: UserRole): void {
    this.roleChange.emit({ action: 'roleChange', user, data: newRole });
  }

  /**
   * Check if user column should be shown
   */
  isColumnVisible(columnId: UserTableColumnId): boolean {
    return this.columns.some(col => col.id === columnId && col.visible);
  }

  /**
   * Check if any actions are available
   */
  hasAnyActions(): boolean {
    return !!(
      this.permissions.canView ||
      this.permissions.canEdit ||
      this.permissions.canDelete ||
      this.permissions.canToggleStatus ||
      this.permissions.canChangeRole
    );
  }

  /**
   * Track by function for performance
   */
  trackByUserId(index: number, user: any): string {
    return user._id || user.id || index.toString();
  }
}

