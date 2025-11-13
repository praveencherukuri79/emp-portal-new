import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReportService } from '../../../services/report.service';
import { UINotificationService } from '../../../core/services/notification.service';
import { ITeamReportResponse } from '@shared/types/responses';

@Component({
  selector: 'app-team-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule
  ],
  templateUrl: './team-reports.component.html',
  styleUrls: ['./team-reports.component.scss']
})
export class TeamReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private notification = inject(UINotificationService);

  loading = signal(false);
  reports = signal<ITeamReportResponse | null>(null);

  ngOnInit(): void {
    this.loadTeamReports();
  }

  loadTeamReports(): void {
    this.loading.set(true);
    this.reportService.getTeamReport().subscribe({
      next: (response) => {
        if (response instanceof Blob) {
          // Handle blob response (shouldn't happen for JSON format)
          this.loading.set(false);
          return;
        }
        if (response.status === 'success' && response.data) {
          this.reports.set(response.data as ITeamReportResponse);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading team reports:', error);
        this.notification.showError('Failed to load team reports');
        this.loading.set(false);
      }
    });
  }

  getTeamSize(): number {
    const report = this.reports();
    return report?.teamSize || 0;
  }

  getTeamMembersCount(): number {
    const report = this.reports();
    return report?.teamMembers?.length || 0;
  }

  getTimesheetStat(key: string): number {
    const report = this.reports() as any;
    return report?.timesheetStats?.[key] || 0;
  }

  getLeaveStat(key: string): number {
    const report = this.reports() as any;
    return report?.leaveStats?.[key] || 0;
  }

  calculateUtilization(): number {
    const teamSize = this.getTeamSize();
    const activeCount = this.getTeamMembersCount();
    if (teamSize === 0) return 0;
    return Math.round((activeCount / teamSize) * 100);
  }

  exportReport(format: 'pdf' | 'excel'): void {
    this.loading.set(true);
    this.reportService.getTeamReport({ format }).subscribe({
      next: (response) => {
        if (response instanceof Blob) {
          // Download the file
          const url = window.URL.createObjectURL(response);
          const link = document.createElement('a');
          link.href = url;
          link.download = `team-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.notification.showSuccess(`Report exported as ${format.toUpperCase()}`);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error exporting report:', error);
        this.notification.showError(`Failed to export report as ${format.toUpperCase()}`);
        this.loading.set(false);
      }
    });
  }
}

