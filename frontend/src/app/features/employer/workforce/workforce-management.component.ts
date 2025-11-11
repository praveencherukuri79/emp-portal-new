import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from '../../../services/user.service';
import { DashboardService } from '../../../services/dashboard.service';
import { UINotificationService } from '../../../core/services/notification.service';

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
    MatChipsModule
  ],
  templateUrl: './workforce-management.component.html',
  styleUrls: ['./workforce-management.component.scss']
})
export class WorkforceManagementComponent implements OnInit {
  private userService = inject(UserService);
  private dashboardService = inject(DashboardService);
  private notification = inject(UINotificationService);

  loading = signal(false);
  error = signal<string | null>(null);
  workforceData = signal<any>(null);
  employees = signal<any[]>([]);

  displayedColumns = ['name', 'department', 'role', 'status', 'actions'];

  ngOnInit(): void {
    this.loadWorkforceData();
  }

  loadWorkforceData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load dashboard data for workforce metrics
    this.dashboardService.getDashboard().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.workforceData.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading workforce data:', error);
        this.error.set('Failed to load workforce data');
        this.loading.set(false);
      }
    });

    // Load all employees
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.employees.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }
}
