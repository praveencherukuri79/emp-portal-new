import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { getRoleDashboard } from '@shared/types/role-config';
import { take } from 'rxjs';

@Component({
  selector: 'app-dashboard-router',
  standalone: true,
  template: '<p>Redirecting...</p>'
})
export class DashboardRouterComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Guard should have already loaded user, but ensure it's loaded
    this.authService.ensureUserLoaded$().pipe(
      take(1)
    ).subscribe((user) => {
      if (user) {
        this.redirectToRoleDashboard(user.role);
      } else {
        // No user found, redirect to login
        this.router.navigate(['/auth/login']);
      }
    });
  }

  private redirectToRoleDashboard(role: UserRole): void {
    // Use configuration to get dashboard route
    const dashboardRoute = getRoleDashboard(role);
    this.router.navigate([dashboardRoute]);
  }
}

