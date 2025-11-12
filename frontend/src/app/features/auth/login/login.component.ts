import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { isSuccessResponse, UserRole } from '../../../core/models/user.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Get return URL from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  ngOnInit(): void {
    // If user is already authenticated, redirect to their dashboard
    if (this.authService.isAuthenticated()) {
      this.authService.ensureUserLoaded$().pipe(
        take(1)
      ).subscribe((user) => {
        if (user) {
          // User is authenticated, redirect to their role-based dashboard
          const dashboardRoute = this.getRoleDashboardRoute(user.role);
          this.router.navigate([dashboardRoute]);
        }
      });
    }
  }

  private getRoleDashboardRoute(role: UserRole): string {
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
        return '/dashboard';
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        if (isSuccessResponse(response)) {
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);
        this.snackBar.open(
          error.error?.message || 'Login failed. Please check your credentials.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          }
        );
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
