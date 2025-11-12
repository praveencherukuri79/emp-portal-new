import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReportService } from '../../../services/report.service';
import { UINotificationService } from '../../../core/services/notification.service';
import { EmployerService } from '../../../services/employer.service';
import {
  IEmployerFinancialOverview,
  IEmployerFinancialSummary
} from '@shared/types';

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
    FormsModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './financial-reports.component.html',
  styleUrls: ['./financial-reports.component.scss']
})
export class FinancialReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private employerService = inject(EmployerService);
  private uiNotification = inject(UINotificationService);

  loading = signal(false);
  error = signal<string | null>(null);
  financialData = signal<IEmployerFinancialOverview | null>(null);
  selectedPeriod = signal<'month' | 'quarter' | 'year'>('month');

  summary = computed<IEmployerFinancialSummary | null>(() => this.financialData()?.summary ?? null);
  revenueByDepartment = computed(() => this.financialData()?.revenueByDepartment ?? []);
  revenueByMonth = computed(() => this.financialData()?.revenueByMonth ?? []);
  topProjects = computed(() => this.financialData()?.topProjects ?? []);
  expensesByCategory = computed(() => this.financialData()?.expensesByCategory ?? []);

  displayedColumns = ['department', 'revenue', 'percentage'];

  ngOnInit(): void {
    this.loadFinancialReports();
  }

  loadFinancialReports(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.employerService.getFinancialOverview(this.selectedPeriod()).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.financialData.set(response.data);
        } else {
          this.error.set(response.message ?? 'Failed to load financial reports');
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

  onPeriodChange(period: 'month' | 'quarter' | 'year'): void {
    if (this.selectedPeriod() === period) {
      return;
    }
    this.selectedPeriod.set(period);
    this.loadFinancialReports();
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

  getPeriodLabel(period: 'month' | 'quarter' | 'year'): string {
    switch (period) {
      case 'year':
        return 'This Year';
      case 'quarter':
        return 'This Quarter';
      default:
        return 'This Month';
    }
  }

  private getEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatCurrency(value: number | undefined | null): string {
    const amount = value ?? 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

