import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { User } from '../../../core/models/user.model';
import { StatsCardComponent, StatsCardData } from '../../../shared/components/stats-card/stats-card.component';

interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error';
}

interface DepartmentSummary {
  department: string;
  employeeCount: number;
  activeCount: number;
  onLeaveCount: number;
}

interface RecentUserChange {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  details?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatProgressSpinnerModule, 
    MatButtonModule, 
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTableModule,
    StatsCardComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  systemHealth = signal<SystemHealth>({
    cpu: 0,
    memory: 0,
    storage: 0,
    status: 'healthy'
  });
  activityLogs = signal<ActivityLog[]>([]);
  departmentSummary = signal<DepartmentSummary[]>([]);
  recentUserChanges = signal<RecentUserChange[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  stats = signal({
    totalUsers: 0,
    activeUsers: 0,
    departments: 0,
    systemUptime: '',
    recentChanges: 0
  });

  statsCards = signal<StatsCardData[]>([]);
  departmentColumns = ['department', 'employees', 'active', 'onLeave'];
  activityColumns = ['user', 'action', 'timestamp'];

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
            totalUsers: data.totalUsers || 0,
            activeUsers: data.activeUsers || 0,
            departments: data.departments || 0,
            systemUptime: data.systemUptime || 'N/A',
            recentChanges: data.recentChanges || 0
          });

          // Create interactive stats cards
          this.statsCards.set([
            {
              title: 'Total Users',
              value: (data.totalUsers || 0).toString(),
              icon: 'people',
              color: 'primary',
              route: '/admin/users',
              clickable: true,
              subtitle: 'all users'
            },
            {
              title: 'Active Users',
              value: (data.activeUsers || 0).toString(),
              icon: 'person',
              color: 'success',
              route: '/admin/users',
              clickable: true,
              subtitle: 'currently active'
            },
            {
              title: 'Departments',
              value: (data.departments || 0).toString(),
              icon: 'business',
              color: 'info',
              route: '/admin/settings',
              clickable: true,
              subtitle: 'total departments'
            },
            {
              title: 'System Uptime',
              value: data.systemUptime || 'N/A',
              icon: 'dns',
              color: 'warning',
              route: '/admin/settings',
              clickable: true,
              subtitle: 'system status'
            }
          ]);

          if (data.systemHealth) {
            this.systemHealth.set(data.systemHealth);
          }

          if (data.activityLogs) {
            this.activityLogs.set(data.activityLogs);
          }

          if (data.departmentSummary) {
            this.departmentSummary.set(data.departmentSummary);
          }

          if (data.recentUserChanges) {
            this.recentUserChanges.set(data.recentUserChanges);
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

  getHealthStatus(): string {
    const health = this.systemHealth();
    const maxUsage = Math.max(health.cpu, health.memory, health.storage);
    
    if (maxUsage >= 90) return 'critical';
    if (maxUsage >= 75) return 'warning';
    return 'healthy';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActivityIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'info': 'info',
      'warning': 'warning',
      'error': 'error'
    };
    return iconMap[type] || 'info';
  }
}
