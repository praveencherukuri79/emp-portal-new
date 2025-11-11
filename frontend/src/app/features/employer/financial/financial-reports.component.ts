import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report.service';
import { DashboardService } from '../../../services/dashboard.service';
import { UINotificationService } from '../../../core/services/notification.service';

interface FinancialData {
  totalRevenue: number;
  billableHours: number;
  revenueByDepartment: Array<{ department: string; revenue: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topProjects: Array<{ project: string; revenue: number }>;
}

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTabsModule,
    FormsModule
  ],
  templateUrl: './financial-reports.component.html',
  styleUrls: ['./financial-reports.component.scss']
})
export class FinancialReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private dashboardService = inject(DashboardService);
  private uiNotification = inject(UINotificationService);

  loading = signal(false);
  error = signal<string | null>(null);
  financialData = signal<FinancialData | null>(null);
  selectedPeriod = signal<'month' | 'quarter' | 'year'>('month');

  displayedColumns = ['department', 'revenue', 'percentage'];

  ngOnInit(): void {
    this.loadFinancialReports();
  }

  loadFinancialReports(): void {
    this.loading.set(true);
    this.error.set(null);
    
    // Get financial data from dashboard API
    this.dashboardService.getDashboard().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const data = response.data;
          // Map dashboard data to financial data structure
          this.financialData.set({
            totalRevenue: data.totalRevenue || 0,
            billableHours: data.billableHours || 0,
            revenueByDepartment: data.revenueByDepartment || [],
            revenueByMonth: data.revenueByMonth || [],
            topProjects: data.topProjects || []
          });
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading financial reports:', error);
        this.error.set('Failed to load financial reports');
        this.loading.set(false);
      }
    });
  }

  exportReport(format: 'pdf' | 'excel'): void {
    this.reportService.getTimesheetReport({
      format,
      startDate: this.getStartDate(),
      endDate: this.getEndDate()
    }).subscribe({
      next: (blob) => {
        this.reportService.downloadFile(blob, `financial-report-${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
        this.uiNotification.showSuccess(`Report exported as ${format.toUpperCase()}`);
      },
      error: (error) => {
        console.error('Error exporting report:', error);
        this.uiNotification.showError('Failed to export report');
      }
    });
  }

  private getStartDate(): string {
    const now = new Date();
    if (this.selectedPeriod() === 'month') {
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else if (this.selectedPeriod() === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
    } else {
      return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    }
  }

  private getEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}

