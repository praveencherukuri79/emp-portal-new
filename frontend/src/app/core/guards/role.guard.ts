import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRoles = route.data['roles'] as UserRole[];
  const currentUser = authService.currentUser();
  
  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }
  
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(currentUser.role)) {
      // Redirect to appropriate dashboard based on role
      router.navigate([getRoleDashboardRoute(currentUser.role)]);
      return false;
    }
  }
  
  return true;
};

function getRoleDashboardRoute(role: UserRole): string {
  switch (role) {
    case UserRole.PROSPECT:
      return '/prospect/dashboard';
    case UserRole.EMPLOYEE:
      return '/employee/dashboard';
    case UserRole.SUPERVISOR:
      return '/supervisor/dashboard';
    case UserRole.HR:
      return '/hr/dashboard';
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.EMPLOYER:
      return '/employer/dashboard';
    default:
      return '/auth/login';
  }
}
