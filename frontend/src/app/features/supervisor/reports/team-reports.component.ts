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
  reports = signal<any[]>([]);

  ngOnInit(): void {
    this.loadTeamReports();
  }

  loadTeamReports(): void {
    this.loading.set(true);
    this.reportService.getTeamReport().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.reports.set(response.data);
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

  exportReport(format: 'pdf' | 'excel'): void {
    this.notification.showInfo(`Exporting report as ${format.toUpperCase()}...`);
  }
}

