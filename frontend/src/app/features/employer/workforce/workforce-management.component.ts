import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import dayjs from 'dayjs';
import { EMPLOYMENT_TYPE_LABELS } from '@shared/types/constants';
import {
  IEmployerDistributionMetric,
  IEmployerTopPerformer,
  IEmployerWorkforceEmployee,
  IEmployerWorkforceOverview,
  IEmployerWorkforceSummary,
  IEmployerRecentHire
} from '@shared/types';
import { EmployerService } from '../../../services/employer.service';

@Component({
  selector: 'app-workforce-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatListModule
  ],
  templateUrl: './workforce-management.component.html',
  styleUrls: ['./workforce-management.component.scss']
})
export class WorkforceManagementComponent implements OnInit {
  private employerService = inject(EmployerService);

  loading = signal(false);
  error = signal<string | null>(null);
  workforceData = signal<IEmployerWorkforceOverview | null>(null);
  Math = Math;

  summary = computed<IEmployerWorkforceSummary | null>(() => this.workforceData()?.summary ?? null);
  departmentDistribution = computed<IEmployerDistributionMetric[]>(
    () => this.workforceData()?.departmentDistribution ?? []
  );
  employmentTypeDistribution = computed<IEmployerDistributionMetric[]>(
    () => this.workforceData()?.employmentTypeDistribution ?? []
  );
  tenureDistribution = computed<IEmployerDistributionMetric[]>(
    () => this.workforceData()?.tenureDistribution ?? []
  );
  topPerformers = computed<IEmployerTopPerformer[]>(
    () => this.workforceData()?.topPerformers ?? []
  );
  recentHires = computed<IEmployerRecentHire[]>(
    () => this.workforceData()?.recentHires ?? []
  );
  employees = computed<IEmployerWorkforceEmployee[]>(
    () => this.workforceData()?.employees ?? []
  );
  utilizationRate = computed<number>(() => {
    const data = this.summary();
    if (!data || data.totalEmployees === 0) {
      return 0;
    }
    return Number(((data.activeEmployees / data.totalEmployees) * 100).toFixed(1));
  });

  displayedColumns: string[] = ['name', 'department', 'role', 'employmentType', 'tenure', 'status', 'actions'];

  ngOnInit(): void {
    this.loadWorkforceData();
  }

  loadWorkforceData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.employerService.getWorkforceOverview().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.workforceData.set(response.data);
        } else {
          this.error.set(response.message ?? 'Failed to load workforce data');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading workforce data:', error);
        this.error.set('Failed to load workforce data');
        this.loading.set(false);
      }
    });
  }

  getInitials(employee: IEmployerWorkforceEmployee): string {
    const firstInitial = employee.firstName?.charAt(0) ?? employee.fullName.charAt(0) ?? '';
    const lastInitial = employee.lastName?.charAt(0) ?? employee.fullName.split(' ')[1]?.charAt(0) ?? '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  getEmploymentTypeLabel(type?: string): string {
    if (!type) {
      return 'N/A';
    }
    const key = type.replace(/-/, '_').toUpperCase() as keyof typeof EMPLOYMENT_TYPE_LABELS;
    return EMPLOYMENT_TYPE_LABELS[key] ?? type;
  }

  getTenureLabel(joiningDate?: string): string {
    if (!joiningDate) {
      return 'N/A';
    }

    const start = dayjs(joiningDate);
    if (!start.isValid()) {
      return 'N/A';
    }

    const months = dayjs().diff(start, 'month');
    if (months <= 0) {
      return '< 1 mo';
    }

    if (months < 12) {
      return `${months} mo`;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
      return `${years} yr${years > 1 ? 's' : ''}`;
    }

    return `${years} yr ${remainingMonths} mo`;
  }
}
