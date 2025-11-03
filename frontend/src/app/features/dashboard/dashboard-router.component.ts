import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

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
    const currentUser = this.authService.currentUser();
    
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Redirect based on user role
    switch (currentUser.role) {
      case UserRole.PROSPECT:
        this.router.navigate(['/prospect/dashboard']);
        break;
      case UserRole.EMPLOYEE:
        this.router.navigate(['/employee/dashboard']);
        break;
      case UserRole.SUPERVISOR:
        this.router.navigate(['/supervisor/dashboard']);
        break;
      case UserRole.HR:
        this.router.navigate(['/hr/dashboard']);
        break;
      case UserRole.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      case UserRole.EMPLOYER:
        this.router.navigate(['/employer/dashboard']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }
}
