import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
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
  { 
    path: 'dashboard', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard - Employee Portal'
  },
  {
    path: 'timesheets',
    canActivate: [authGuard],
    loadComponent: () => import('./features/timesheets/components/weekly-grid.component').then(m => m.WeeklyGridComponent),
    title: 'Timesheets - Employee Portal'
  },
  {
    path: 'leaves',
    canActivate: [authGuard],
    loadComponent: () => import('./features/leaves/leave-management.component').then(m => m.LeaveManagementComponent),
    title: 'Leave Management - Employee Portal'
  },
  {
    path: 'documents',
    canActivate: [authGuard],
    loadComponent: () => import('./features/documents/documents.component').then(m => m.DocumentsComponent),
    title: 'Documents - Employee Portal'
  },
  {
    path: 'approvals',
    canActivate: [authGuard],
    loadComponent: () => import('./features/approvals/approvals.component').then(m => m.ApprovalsComponent),
    title: 'Approvals - Employee Portal'
  },
  { path: '**', redirectTo: '/dashboard' }
];
