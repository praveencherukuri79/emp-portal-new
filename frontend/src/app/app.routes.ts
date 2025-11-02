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
  { path: '**', redirectTo: '/dashboard' }
];
