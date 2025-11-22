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
import { getAllRoleConfigs, getRoleIcon } from '@shared/types/role-config';
import { Permission, getRolePermissions } from '@shared/types/permissions';

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
    // Use configuration to build roles list
    setTimeout(() => {
      const roleConfigs = getAllRoleConfigs();
      this.roles = roleConfigs.map(config => ({
        role: config.role,
        label: config.label,
        description: config.description,
        permissions: getRolePermissions(config.role).map((p: Permission) => p.replace(/_/g, ' ').toLowerCase())
      }));
      this.loading.set(false);
    }, 500);
  }

  getRoleIcon(role: UserRole): string {
    // Use configuration for role icons
    return getRoleIcon(role);
  }
}

