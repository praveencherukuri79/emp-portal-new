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
    loadComponent: () => import('./features/dashboard/dashboard-router.component').then(m => m.DashboardRouterComponent),
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
    data: { roles: [UserRole.PROSPECT, UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboards/prospect-dashboard/prospect-dashboard.component').then(m => m.ProspectDashboardComponent),
        title: 'Prospect Dashboard - Employee Portal'
      }
    ]
  },

  // Employee Routes
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Employee Dashboard - Employee Portal'
      },
      {
        path: 'timesheets',
        loadComponent: () => import('./features/timesheets/components/weekly-grid.component').then(m => m.WeeklyGridComponent),
        title: 'Timesheets - Employee Portal'
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
        loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
        title: 'Team Management - Employee Portal'
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
        title: 'Team Reports - Employee Portal'
      }
    ]
  },

  // HR Routes
  {
    path: 'hr',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboards/hr-dashboard/hr-dashboard.component').then(m => m.HrDashboardComponent),
        title: 'HR Dashboard - Employee Portal'
      },
      {
        path: 'leaves',
        loadComponent: () => import('./features/leaves/leave-management.component').then(m => m.LeaveManagementComponent),
        title: 'Leave Management - Employee Portal'
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
        title: 'Employee Management - Employee Portal'
      },
      {
        path: 'documents',
        loadComponent: () => import('./features/documents/documents.component').then(m => m.DocumentsComponent),
        title: 'Document Management - Employee Portal'
      }
    ]
  },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.EMPLOYER] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboards/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard - Employee Portal'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
        title: 'User Management - Employee Portal'
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
        title: 'Role Management - Employee Portal'
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
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
        path: 'dashboard',
        loadComponent: () => import('./features/dashboards/employer-dashboard/employer-dashboard.component').then(m => m.EmployerDashboardComponent),
        title: 'Employer Dashboard - Employee Portal'
      },
      {
        path: 'financial',
        loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
        title: 'Financial Reports - Employee Portal'
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
        title: 'Business Analytics - Employee Portal'
      },
      {
        path: 'workforce',
        loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
        title: 'Workforce Management - Employee Portal'
      }
    ]
  },

  // Legacy routes - redirect to role-based routes
  { 
    path: 'dashboard', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard-router.component').then(m => m.DashboardRouterComponent),
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
  
  { path: '**', redirectTo: '' }
];
