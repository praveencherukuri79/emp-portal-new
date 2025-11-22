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
import { StatsCardComponent, StatsCardData } from '../../../shared/components/stats-card/stats-card.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    StatsCardComponent
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  statsCards = signal<StatsCardData[]>([]);
  recentActivity = signal<any[]>([]);

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
          
          // Create interactive stats cards
          this.statsCards.set([
            {
              title: 'Hours This Week',
              value: data.hoursThisWeek?.toString() || '0',
              icon: 'schedule',
              color: 'primary',
              route: '/employee/timesheets',
              clickable: true,
              trend: data.hoursTrend ? { 
                value: Math.abs(data.hoursTrend), 
                isPositive: data.hoursTrend > 0 
              } : undefined
            },
            {
              title: 'Pending Leaves',
              value: (data.pendingLeaves || 0).toString(),
              icon: 'event_busy',
              color: 'warning',
              route: '/employee/leaves',
              clickable: true,
              subtitle: 'awaiting approval'
            },
            {
              title: 'Leave Balance',
              value: (data.leaveBalance || 0).toString(),
              icon: 'beach_access',
              color: 'success',
              route: '/employee/leaves',
              clickable: true,
              subtitle: 'days remaining'
            },
            {
              title: 'Documents',
              value: (data.documentCount || 0).toString(),
              icon: 'folder',
              color: 'info',
              route: '/employee/documents',
              clickable: true,
              subtitle: 'uploaded'
            }
          ]);

          if (data.recentActivity) {
            this.recentActivity.set(data.recentActivity);
          }
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


