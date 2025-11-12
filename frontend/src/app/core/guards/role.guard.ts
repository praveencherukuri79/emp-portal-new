import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { map, first, catchError, of } from 'rxjs';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as UserRole[];
  
  return authService.ensureUserLoaded$().pipe(
    first(),
    map((user) => {
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }
      
      if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        router.navigate([getRoleDashboardRoute(user.role)]);
        return false;
      }
      
      return true;
    }),
    catchError(() => {
      router.navigate(['/auth/login']);
      return of(false);
    })
  );
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
