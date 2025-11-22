import { TemplateRef } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { IEmployerWorkforceEmployee } from '@shared/types';

/**
 * Column configuration for the user table
 */
export interface UserTableColumn {
  id: string;                    // Column identifier
  label: string;                 // Display label
  visible: boolean;              // Show/hide column
  sortable?: boolean;            // Enable sorting (future)
  width?: string;                // Column width
  customTemplate?: TemplateRef<any>;  // Custom cell template
}

/**
 * Permission configuration for user table actions
 */
export interface UserTablePermissions {
  canView?: boolean;             // Can view details
  canEdit?: boolean;             // Can edit user
  canDelete?: boolean;           // Can delete user
  canChangeRole?: boolean;       // Can change user role
  canToggleStatus?: boolean;     // Can activate/deactivate
  canCreate?: boolean;           // Can create new users
}

/**
 * Action event emitted from user table
 */
export interface UserTableAction<T = any> {
  action: 'view' | 'edit' | 'delete' | 'statusToggle' | 'roleChange';
  user: T;
  data?: any;  // Additional data (e.g., new role for roleChange)
}

/**
 * Union type for table data sources
 */
export type UserTableData = User | IEmployerWorkforceEmployee;

/**
 * Column IDs available in the user table
 */
export enum UserTableColumnId {
  NAME = 'name',
  EMAIL = 'email',
  EMPLOYEE_ID = 'employeeId',
  ROLE = 'role',
  DEPARTMENT = 'department',
  EMPLOYMENT_TYPE = 'employmentType',
  TENURE = 'tenure',
  STATUS = 'status',
  ACTIONS = 'actions'
}

/**
 * Default column configurations for different views
 */
export const DEFAULT_COLUMNS = {
  ADMIN: [
    { id: UserTableColumnId.NAME, label: 'Name', visible: true },
    { id: UserTableColumnId.EMAIL, label: 'Email', visible: true },
    { id: UserTableColumnId.ROLE, label: 'Role', visible: true },
    { id: UserTableColumnId.DEPARTMENT, label: 'Department', visible: true },
    { id: UserTableColumnId.STATUS, label: 'Status', visible: true },
    { id: UserTableColumnId.ACTIONS, label: 'Actions', visible: true }
  ],
  HR: [
    { id: UserTableColumnId.NAME, label: 'Name', visible: true },
    { id: UserTableColumnId.EMPLOYEE_ID, label: 'Employee ID', visible: true },
    { id: UserTableColumnId.DEPARTMENT, label: 'Department', visible: true },
    { id: UserTableColumnId.ROLE, label: 'Role', visible: true },
    { id: UserTableColumnId.STATUS, label: 'Status', visible: true },
    { id: UserTableColumnId.ACTIONS, label: 'Actions', visible: true }
  ],
  EMPLOYER: [
    { id: UserTableColumnId.NAME, label: 'Name', visible: true },
    { id: UserTableColumnId.DEPARTMENT, label: 'Department', visible: true },
    { id: UserTableColumnId.ROLE, label: 'Role', visible: true },
    { id: UserTableColumnId.EMPLOYMENT_TYPE, label: 'Employment Type', visible: true },
    { id: UserTableColumnId.TENURE, label: 'Tenure', visible: true },
    { id: UserTableColumnId.STATUS, label: 'Status', visible: true },
    { id: UserTableColumnId.ACTIONS, label: 'Actions', visible: true }
  ]
};


