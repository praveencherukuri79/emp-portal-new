import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { EmployerService } from '../../../services/employer.service';
import {
  IEmployerAnalyticsOverview,
  IEmployerPerformanceTrends,
  IEmployerProductivityMetrics,
  IEmployerResourceUtilization
} from '@shared/types';

@Component({
  selector: 'app-business-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatListModule
  ],
  templateUrl: './business-analytics.component.html',
  styleUrls: ['./business-analytics.component.scss']
})
export class BusinessAnalyticsComponent implements OnInit {
  private employerService = inject(EmployerService);

  loading = signal(false);
  error = signal<string | null>(null);
  analyticsData = signal<IEmployerAnalyticsOverview | null>(null);
  Math = Math;

  productivity = computed<IEmployerProductivityMetrics | null>(() => this.analyticsData()?.productivity ?? null);
  resourceUtilization = computed<IEmployerResourceUtilization | null>(
    () => this.analyticsData()?.resourceUtilization ?? null
  );
  performanceTrends = computed<IEmployerPerformanceTrends | null>(
    () => this.analyticsData()?.performanceTrends ?? null
  );

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.employerService.getBusinessAnalytics().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.analyticsData.set(response.data);
        } else {
          this.error.set(response.message ?? 'Failed to load analytics data');
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

