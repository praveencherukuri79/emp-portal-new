import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-prospect-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './prospect-dashboard.component.html',
  styleUrls: ['./prospect-dashboard.component.scss']
})
export class ProspectDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  profileCompletion = signal(0);

  // Computed values for profile completion
  circumference = computed(() => 2 * Math.PI * 52); // radius = 52
  offset = computed(() => {
    const completion = this.profileCompletion();
    return this.circumference() - (completion / 100) * this.circumference();
  });

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboard().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          const data = response.data;
          this.profileCompletion.set(data.profileCompletion || this.calculateProfileCompletion());
        } else {
          this.profileCompletion.set(this.calculateProfileCompletion());
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.error.set('Failed to load dashboard data. Please try again.');
        this.profileCompletion.set(this.calculateProfileCompletion());
        this.loading.set(false);
      }
    });
  }

  calculateProfileCompletion(): number {
    const user = this.currentUser();
    if (!user) return 0;

    let completed = 0;
    let total = 4;

    // Basic info (name, email, phone)
    if (user.firstName && user.lastName && user.email) completed++;
    
    // Personal info (dateOfBirth, gender)
    if (user.dateOfBirth && user.gender) completed++;
    
    // Address
    if (user.address) {
      if (typeof user.address === 'string' && user.address.length > 0) {
        completed++;
      } else if (typeof user.address === 'object' && (user.address.street || user.address.city)) {
        completed++;
      }
    }
    
    // Documents (would need to check document service)
    // For now, assume not completed
    // completed++;

    return Math.round((completed / total) * 100);
  }

  hasBasicInfo(): boolean {
    const user = this.currentUser();
    return !!(user?.firstName && user?.lastName && user?.email);
  }

  hasPersonalInfo(): boolean {
    const user = this.currentUser();
    return !!(user?.dateOfBirth && user?.gender);
  }

  hasAddress(): boolean {
    const user = this.currentUser();
    if (!user?.address) return false;
    // Address can be string or IAddress object
    if (typeof user.address === 'string') {
      return user.address.length > 0;
    }
    return !!(user.address.street || user.address.city);
  }

  hasDocuments(): boolean {
    // Would need to check document service
    return false;
  }
}

