import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';
import { Permission } from '@shared/types/permissions';
import { getRoleDashboard } from '@shared/types/role-config';
import { map, first, catchError, of } from 'rxjs';

/**
 * Permission Guard
 * Checks if user has specific permissions to access route
 * Usage: canActivate: [permissionGuard], data: { permissions: [Permission.CAN_VIEW_ALL_DOCUMENTS] }
 */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  
  const requiredPermissions = route.data['permissions'] as Permission[];
  const requireAll = route.data['requireAllPermissions'] === true; // Default false (any permission)
  
  if (!requiredPermissions || requiredPermissions.length === 0) {
    console.warn('Permission guard used without specifying permissions');
    return true;
  }
  
  return authService.ensureUserLoaded$().pipe(
    first(),
    map((user) => {
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }
      
      // Check if user has required permissions
      const hasPermission = requireAll
        ? requiredPermissions.every(p => permissionService.hasPermission(p))
        : requiredPermissions.some(p => permissionService.hasPermission(p));
      
      if (!hasPermission) {
        // Redirect to user's dashboard
        router.navigate([getRoleDashboard(user.role)]);
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
 * Any Permission Guard
 * User needs at least ONE of the specified permissions
 */
export const anyPermissionGuard = (permissions: Permission[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    route.data = { ...route.data, permissions, requireAllPermissions: false };
    return permissionGuard(route, {} as any);
  };
};

/**
 * All Permissions Guard
 * User needs ALL specified permissions
 */
export const allPermissionsGuard = (permissions: Permission[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    route.data = { ...route.data, permissions, requireAllPermissions: true };
    return permissionGuard(route, {} as any);
  };
};


