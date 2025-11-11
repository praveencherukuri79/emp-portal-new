import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { UINotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';
import { StatsCardComponent, StatsCardData } from '../../../shared/components/stats-card/stats-card.component';

interface DocumentAlert {
  id: string;
  employeeName: string;
  documentType: string;
  expiryDate: Date;
  status: 'expired' | 'expiring-soon' | 'missing';
}

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatProgressSpinnerModule, 
    MatButtonModule, 
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    StatsCardComponent
  ],
  templateUrl: './hr-dashboard.component.html',
  styleUrls: ['./hr-dashboard.component.scss']
})
export class HrDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  documentAlerts = signal<DocumentAlert[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  stats = signal({
    totalEmployees: 0,
    pendingLeaves: 0,
    documentAlerts: 0,
    complianceRate: 0
  });

  statsCards = signal<StatsCardData[]>([]);
  leaveStats = signal({
    approvedThisMonth: 0,
    pendingApproval: 0,
    rejectedThisMonth: 0
  });

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
  private notification: UINotificationService
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
            totalEmployees: data.totalEmployees || 0,
            pendingLeaves: data.pendingLeaves || 0,
            documentAlerts: data.documentAlerts || 0,
            complianceRate: data.complianceRate || 0
          });

          // Create interactive stats cards
          this.statsCards.set([
            {
              title: 'Total Employees',
              value: (data.totalEmployees || 0).toString(),
              icon: 'people',
              color: 'primary',
              route: '/hr/employees',
              clickable: true,
              subtitle: 'organization-wide'
            },
            {
              title: 'Pending Leaves',
              value: (data.pendingLeaves || 0).toString(),
              icon: 'event_busy',
              color: 'warning',
              route: '/hr/leaves',
              clickable: true,
              subtitle: 'awaiting approval'
            },
            {
              title: 'Document Alerts',
              value: (data.documentAlerts || 0).toString(),
              icon: 'warning',
              color: 'danger',
              route: '/hr/documents',
              clickable: true,
              subtitle: 'require attention'
            },
            {
              title: 'Compliance Rate',
              value: `${(data.complianceRate || 0)}%`,
              icon: 'verified',
              color: 'success',
              route: '/hr/documents',
              clickable: true,
              subtitle: 'document compliance'
            }
          ]);

          this.leaveStats.set({
            approvedThisMonth: data.leaveStats?.approvedThisMonth || 0,
            pendingApproval: data.leaveStats?.pendingApproval || 0,
            rejectedThisMonth: data.leaveStats?.rejectedThisMonth || 0
          });

          if (data.documentAlerts) {
            this.documentAlerts.set(data.documentAlerts);
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

  handleAlert(id: string): void {
    // Navigate to document management or send notification
    this.notification.showInfo(`Handling document alert: ${id}`);
    // TODO: Implement full alert handling via DocumentService when API is ready
  }
}
