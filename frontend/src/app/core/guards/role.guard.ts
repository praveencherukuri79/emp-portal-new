import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { getRoleDashboard } from '@shared/types/role-config';
import { map, first, catchError, of } from 'rxjs';

/**
 * Role Guard
 * Checks if user has one of the required roles
 * Usage: canActivate: [roleGuard], data: { roles: [UserRole.ADMIN, UserRole.HR] }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as UserRole[];
  
  // If no roles specified, just check authentication
  if (!requiredRoles || requiredRoles.length === 0) {
    console.warn('Role guard used without specifying roles. Use authGuard instead.');
    return true;
  }
  
  return authService.ensureUserLoaded$().pipe(
    first(),
    map((user) => {
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }
      
      // Check if user has any of the required roles
      if (!requiredRoles.includes(user.role)) {
        // Redirect to user's dashboard with message
        router.navigate([getRoleDashboard(user.role)], {
          queryParams: { 
            error: 'insufficient_permissions',
            message: 'You do not have permission to access this page'
          }
        });
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

/**
 * Exact Role Guard
 * User must have exactly the specified role (no hierarchy)
 */
export const exactRoleGuard = (role: UserRole): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    route.data = { ...route.data, roles: [role] };
    return roleGuard(route, {} as any);
  };
};

/**
 * Any of Roles Guard
 * User can have any of the specified roles
 */
export const anyRoleGuard = (roles: UserRole[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    route.data = { ...route.data, roles };
    return roleGuard(route, {} as any);
  };
};
