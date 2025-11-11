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

interface FinancialMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}

@Component({
  selector: 'app-employer-dashboard',
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
  templateUrl: './employer-dashboard.component.html',
  styleUrls: ['./employer-dashboard.component.scss']
})
export class EmployerDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  stats = signal({
    totalRevenue: 0,
    billableHours: 0,
    activeProjects: 0,
    employeeCount: 0
  });

  statsCards = signal<StatsCardData[]>([]);
  financialMetrics = signal<FinancialMetric[]>([]);
  recentProjects = signal<any[]>([]);

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
          
          this.stats.set({
            totalRevenue: data.totalRevenue || 0,
            billableHours: data.billableHours || 0,
            activeProjects: data.activeProjects || 0,
            employeeCount: data.employeeCount || 0
          });

          // Create interactive stats cards
          this.statsCards.set([
            {
              title: 'Total Revenue',
              value: this.formatCurrency(data.totalRevenue || 0),
              icon: 'attach_money',
              color: 'success',
              route: '/employer/financial',
              clickable: true,
              subtitle: 'Year to date'
            },
            {
              title: 'Billable Hours',
              value: (data.billableHours || 0).toLocaleString(),
              icon: 'schedule',
              color: 'primary',
              route: '/employer/analytics',
              clickable: true,
              subtitle: 'this month'
            },
            {
              title: 'Active Projects',
              value: (data.activeProjects || 0).toString(),
              icon: 'folder_special',
              color: 'info',
              route: '/employer/workforce',
              clickable: true,
              subtitle: 'in progress'
            },
            {
              title: 'Total Employees',
              value: (data.employeeCount || 0).toString(),
              icon: 'people',
              color: 'warning',
              route: '/employer/users',
              clickable: true,
              subtitle: 'organization-wide'
            }
          ]);

          if (data.financialMetrics) {
            this.financialMetrics.set(data.financialMetrics);
          }

          if (data.recentProjects) {
            this.recentProjects.set(data.recentProjects);
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  }
}
