import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  { 
    path: '', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard-router.component').then((m: any) => m.DashboardRouterComponent),
    pathMatch: 'full' 
  },
  { 
    path: 'auth/login', 
    component: LoginComponent,
    title: 'Login - Employee Portal'
  },
  { 
    path: 'auth/register', 
    component: RegisterComponent,
    title: 'Register - Employee Portal'
  },
  
  // Prospect Routes
  {
    path: 'prospect',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.PROSPECT] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboards/prospect-dashboard/prospect-dashboard.component').then(m => m.ProspectDashboardComponent),
        title: 'Prospect Dashboard - Employee Portal'
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        title: 'Profile - Employee Portal'
      }
    ]
  },

  // Employee Routes
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboards/employee-dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent),
        title: 'Employee Dashboard - Employee Portal'
      },
      {
        path: 'timesheets',
        loadComponent: () => import('./features/timesheets/components/weekly-grid.component').then(m => m.WeeklyGridComponent),
        title: 'Timesheets - Employee Portal'
      },
      {
        path: 'timesheets/history',
        loadComponent: () => import('./features/timesheets/components/timesheet-history.component').then(m => m.TimesheetHistoryComponent),
        title: 'Timesheet History - Employee Portal'
      },
      {
        path: 'leaves',
        loadComponent: () => import('./features/leaves/leave-management.component').then(m => m.LeaveManagementComponent),
        title: 'Leave Management - Employee Portal'
      },
      {
        path: 'documents',
        loadComponent: () => import('./features/documents/documents.component').then(m => m.DocumentsComponent),
        title: 'Documents - Employee Portal'
      }
    ]
  },

  // Supervisor Routes
  {
    path: 'supervisor',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboards/supervisor-dashboard/supervisor-dashboard.component').then(m => m.SupervisorDashboardComponent),
        title: 'Supervisor Dashboard - Employee Portal'
      },
      {
        path: 'approvals',
        loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
        title: 'Approvals - Employee Portal'
      },
      {
        path: 'team',
        loadComponent: () => import('./features/supervisor/team/team-management.component').then((m: any) => m.TeamManagementComponent),
        title: 'Team Management - Employee Portal'
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/supervisor/reports/team-reports.component').then((m: any) => m.TeamReportsComponent),
        title: 'Team Reports - Employee Portal'
      }
    ]
  },

  // HR Routes
  {
    path: 'hr',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.HR, UserRole.ADMIN] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboards/hr-dashboard/hr-dashboard.component').then(m => m.HrDashboardComponent),
        title: 'HR Dashboard - Employee Portal'
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/hr/employees/employee-management.component').then((m: any) => m.EmployeeManagementComponent),
        title: 'Employee Management - Employee Portal'
      },
      {
        path: 'documents',
        loadComponent: () => import('./features/hr/documents/hr-documents.component').then(m => m.HrDocumentsComponent),
        title: 'Document Management - Employee Portal'
      }
    ]
  },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboards/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard - Employee Portal'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/user-management.component').then((m: any) => m.UserManagementComponent),
        title: 'User Management - Employee Portal'
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/admin/roles/role-management.component').then((m: any) => m.RoleManagementComponent),
        title: 'Role Management - Employee Portal'
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/system-settings.component').then((m: any) => m.SystemSettingsComponent),
        title: 'System Settings - Employee Portal'
      }
    ]
  },

  // Employer Routes
  {
    path: 'employer',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.EMPLOYER] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboards/employer-dashboard/employer-dashboard.component').then(m => m.EmployerDashboardComponent),
        title: 'Employer Dashboard - Employee Portal'
      },
      {
        path: 'approvals',
        loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
        title: 'Approvals - Employee Portal'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/user-management.component').then((m: any) => m.UserManagementComponent),
        title: 'User Management - Employee Portal'
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/system-settings.component').then((m: any) => m.SystemSettingsComponent),
        title: 'Settings - Employee Portal'
      },
      {
        path: 'financial',
        loadComponent: () => import('./features/employer/financial/financial-reports.component').then(m => m.FinancialReportsComponent),
        title: 'Financial Reports - Employee Portal'
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/employer/analytics/business-analytics.component').then(m => m.BusinessAnalyticsComponent),
        title: 'Business Analytics - Employee Portal'
      },
      {
        path: 'workforce',
        loadComponent: () => import('./features/employer/workforce/workforce-management.component').then(m => m.WorkforceManagementComponent),
        title: 'Workforce Management - Employee Portal'
      }
    ]
  },

  // Legacy routes - redirect to role-based routes
  { 
    path: 'dashboard', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard-router.component').then((m: any) => m.DashboardRouterComponent),
    title: 'Dashboard - Employee Portal'
  },
  {
    path: 'timesheets',
    redirectTo: 'employee/timesheets'
  },
  {
    path: 'leaves',
    redirectTo: 'employee/leaves'
  },
  {
    path: 'documents',
    redirectTo: 'employee/documents'
  },
  {
    path: 'approvals',
    redirectTo: 'supervisor/approvals'
  },
  
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
    title: 'Notifications - Employee Portal'
  },
  
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Profile - Employee Portal'
  },
  
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    title: 'Settings - Employee Portal'
  },
  
  { path: '**', redirectTo: '' }
];
