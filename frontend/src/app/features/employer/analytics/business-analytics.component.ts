import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { DashboardService } from '../../../services/dashboard.service';
import { UINotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-business-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './business-analytics.component.html',
  styleUrls: ['./business-analytics.component.scss']
})
export class BusinessAnalyticsComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private notification = inject(UINotificationService);

  loading = signal(false);
  error = signal<string | null>(null);
  analyticsData = signal<any>(null);

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.dashboardService.getDashboard().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.analyticsData.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.error.set('Failed to load analytics data');
        this.loading.set(false);
      }
    });
  }
}
