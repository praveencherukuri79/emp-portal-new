import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-prospect-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './prospect-dashboard.component.html',
  styleUrls: ['./prospect-dashboard.component.scss']
})
export class ProspectDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  profileCompletion = signal(0);

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
          this.profileCompletion.set(data.profileCompletion || 0);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.error.set('Failed to load dashboard data. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
