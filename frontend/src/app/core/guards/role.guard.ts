import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { getRoleDashboard } from '@shared/types/role-config';
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
  // Use configuration to get dashboard route
  return getRoleDashboard(role);
}
