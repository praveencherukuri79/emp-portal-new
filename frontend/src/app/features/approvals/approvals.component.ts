import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TimesheetService } from '../../core/services/timesheet.service';
import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { TimesheetEntry, WeeklyTimesheet } from '../../core/models/timesheet.model';
import { LeaveRequest, LeaveStatus } from '../../core/models/leave.model';
import { UserRole } from '../../core/models/user.model';
import { IPendingTimesheetGroupResponse, ILeaveRequestResponse } from '@shared/types/responses';
import { UINotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { getStatusColor, getStatusLabel } from '../../shared/utils/formatters';
import { LeaveStatus as SharedLeaveStatus } from '@shared/types';
import { Permission } from '@shared/types/permissions';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.scss'
})
export class ApprovalsComponent implements OnInit {
  private timesheetService = inject(TimesheetService);
  private leaveService = inject(LeaveService);
  private dialog = inject(MatDialog);
  private notification = inject(UINotificationService);
  protected permissions = inject(PermissionService);
  
  // Make services public for template access
  authService = inject(AuthService);
  UserRole = UserRole; // Expose enum to template
  
  // Feature flags (configuration-based)
  canApproveTimesheets = this.permissions.canApproveTimesheets();
  canApproveLeaves = this.permissions.canApproveLeaves();
  showOrgWideSubtitle = this.permissions.shouldShowOrgWideSubtitle();
  defaultToLeaveTab = this.permissions.shouldDefaultToLeaveTab();

  // Signals for reactive state
  pendingTimesheets = signal<IPendingTimesheetGroupResponse[]>([]);
  pendingLeaves = signal<ILeaveRequestResponse[]>([]);
  loadingTimesheets = signal(false);
  loadingLeaves = signal(false);
  errorTimesheets = signal<string | null>(null);
  errorLeaves = signal<string | null>(null);

  // Table columns
  timesheetColumns = ['employee', 'week', 'totalHours', 'submittedAt', 'status', 'actions'];
  leaveColumns = ['employee', 'leaveType', 'startDate', 'endDate', 'days', 'reason', 'status', 'actions'];

  ngOnInit(): void {
    this.loadPendingTimesheets();
    this.loadPendingLeaves();
  }

  loadPendingTimesheets(): void {
    this.loadingTimesheets.set(true);
    this.errorTimesheets.set(null);
    this.timesheetService.getPendingTimesheets().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.pendingTimesheets.set(response.data);
        }
        this.loadingTimesheets.set(false);
      },
      error: (error) => {
        console.error('Error loading pending timesheets:', error);
        this.errorTimesheets.set('Failed to load pending timesheets');
        this.loadingTimesheets.set(false);
      }
    });
  }

  loadPendingLeaves(): void {
    this.loadingLeaves.set(true);
    this.errorLeaves.set(null);
    this.leaveService.getPendingApprovals().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.pendingLeaves.set(response.data);
        }
        this.loadingLeaves.set(false);
      },
      error: (error) => {
        console.error('Error loading pending leaves:', error);
        this.errorLeaves.set('Failed to load pending leave requests');
        this.loadingLeaves.set(false);
      }
    });
  }

  approveTimesheet(week: WeeklyTimesheet): void {
    if (!week.entries || week.entries.length === 0) return;

    const entryIds = week.entries.map(e => e._id!).filter(Boolean);
    if (entryIds.length === 0) return;

    const dialogData: ConfirmDialogData = {
      title: 'Approve Timesheet',
      message: `Are you sure you want to approve the timesheet for week ${this.formatDate(week.weekStart)}?`,
      confirmText: 'Approve',
      cancelText: 'Cancel',
      confirmColor: 'primary'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.timesheetService.approveTimesheet(entryIds).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.notification.showSuccess('Timesheet approved successfully');
              this.loadPendingTimesheets();
            }
          },
          error: (error) => {
            console.error('Error approving timesheet:', error);
            this.notification.showError('Failed to approve timesheet');
          }
        });
      }
    });
  }

  rejectTimesheet(week: WeeklyTimesheet): void {
    if (!week.entries || week.entries.length === 0) return;

    const entryIds = week.entries.map(e => e._id!).filter(Boolean);
    if (entryIds.length === 0) return;

    const dialogData: ConfirmDialogData = {
      title: 'Reject Timesheet',
      message: 'Please provide a reason for rejection:',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      confirmColor: 'warn',
      showInput: true,
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter reason for rejection'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && typeof result === 'object' && 'reason' in result && result.reason) {
        this.timesheetService.rejectTimesheet(entryIds, result.reason).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.notification.showSuccess('Timesheet rejected');
              this.loadPendingTimesheets();
            }
          },
          error: (error) => {
            console.error('Error rejecting timesheet:', error);
            this.notification.showError('Failed to reject timesheet');
          }
        });
      }
    });
  }

  approveLeave(leave: LeaveRequest): void {
    if (!leave._id) return;

    const dialogData: ConfirmDialogData = {
      title: 'Approve Leave Request',
      message: `Are you sure you want to approve the leave request from ${this.formatDate(leave.startDate)} to ${this.formatDate(leave.endDate)}?`,
      confirmText: 'Approve',
      cancelText: 'Cancel',
      confirmColor: 'primary'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.leaveService.approveLeaveRequest(leave._id!).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.notification.showSuccess('Leave request approved successfully');
              this.loadPendingLeaves();
            }
          },
          error: (error) => {
            console.error('Error approving leave:', error);
            this.notification.showError('Failed to approve leave request');
          }
        });
      }
    });
  }

  rejectLeave(leave: LeaveRequest): void {
    if (!leave._id) return;

    const dialogData: ConfirmDialogData = {
      title: 'Reject Leave Request',
      message: 'Please provide a reason for rejection:',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      confirmColor: 'warn',
      showInput: true,
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter reason for rejection'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.reason) {
        this.leaveService.rejectLeaveRequest(leave._id!, result.reason).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.notification.showSuccess('Leave request rejected');
              this.loadPendingLeaves();
            }
          },
          error: (error) => {
            console.error('Error rejecting leave:', error);
            this.notification.showError('Failed to reject leave request');
          }
        });
      }
    });
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  getStatusColor(status: string): string {
    const color = getStatusColor(status);
    const colorMap: Record<string, string> = {
      'primary': 'status-success',
      'accent': 'status-warning',
      'warn': 'status-error',
      '': 'status-neutral'
    };
    return colorMap[color] || 'status-neutral';
  }

  getStatusLabel(status: string, type: 'timesheet' | 'leave' = 'leave'): string {
    return getStatusLabel(status, type);
  }

  getEmployeeName(userId: any): string {
    if (!userId) return 'Unknown';
    if (typeof userId === 'string') return userId;
    if (typeof userId === 'object' && userId.firstName && userId.lastName) {
      return `${userId.firstName} ${userId.lastName}`;
    }
    return 'Unknown';
  }

  getSubmittedDate(week: any): string {
    if (week.submittedAt) return this.formatDate(week.submittedAt);
    if (week.entries && week.entries.length > 0 && week.entries[0].submittedAt) {
      return this.formatDate(week.entries[0].submittedAt);
    }
    if (week.entries && week.entries.length > 0) {
      return this.formatDate(week.entries[0].createdAt);
    }
    return 'N/A';
  }

  getTimesheetStatus(week: any): string {
    if (week.entries && week.entries.length > 0) {
      return week.entries[0].status || 'Submitted';
    }
    return 'Submitted';
  }

  getStatusChipColor(week: any): string {
    const status = this.getTimesheetStatus(week);
    if (status === 'submitted') return 'accent';
    if (status === 'approved') return 'primary';
    if (status === 'rejected') return 'warn';
    return 'default';
  }
}

