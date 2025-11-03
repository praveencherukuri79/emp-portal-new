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
import { TimesheetEntry } from '../../core/models/timesheet.model';
import { LeaveRequest, LeaveStatus } from '../../core/models/leave.model';

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

  // Signals for reactive state
  pendingTimesheets = signal<TimesheetEntry[]>([]);
  pendingLeaves = signal<LeaveRequest[]>([]);
  loadingTimesheets = signal(false);
  loadingLeaves = signal(false);

  // Table columns
  timesheetColumns = ['employeeName', 'weekStart', 'totalHours', 'submittedAt', 'actions'];
  leaveColumns = ['employeeName', 'leaveType', 'startDate', 'endDate', 'days', 'reason', 'actions'];

  ngOnInit(): void {
    this.loadPendingTimesheets();
    this.loadPendingLeaves();
  }

  loadPendingTimesheets(): void {
    this.loadingTimesheets.set(true);
    // TODO: Implement getPendingTimesheets in TimesheetService
    // For now, using empty array
    this.pendingTimesheets.set([]);
    this.loadingTimesheets.set(false);
  }

  loadPendingLeaves(): void {
    this.loadingLeaves.set(true);
    this.leaveService.getPendingApprovals().subscribe({
      next: (response) => {
        this.pendingLeaves.set(response.data);
        this.loadingLeaves.set(false);
      },
      error: (error) => {
        console.error('Error loading pending leaves:', error);
        this.loadingLeaves.set(false);
      }
    });
  }

  approveTimesheet(entry: TimesheetEntry): void {
    if (!entry._id) return;
    
    // TODO: Implement approveTimesheet in TimesheetService
    console.log('Approve timesheet:', entry._id);
    this.loadPendingTimesheets();
  }

  rejectTimesheet(entry: TimesheetEntry): void {
    if (!entry._id) return;
    
    const reason = prompt('Rejection reason:');
    if (reason) {
      // TODO: Implement rejectTimesheet in TimesheetService
      console.log('Reject timesheet:', entry._id, reason);
      this.loadPendingTimesheets();
    }
  }

  approveLeave(leave: LeaveRequest): void {
    if (!leave._id) return;
    
    this.leaveService.approveRejectLeave({
      leaveId: leave._id,
      action: 'approve'
    }).subscribe({
      next: () => {
        this.loadPendingLeaves();
      },
      error: (error) => {
        console.error('Error approving leave:', error);
      }
    });
  }

  rejectLeave(leave: LeaveRequest): void {
    if (!leave._id) return;
    
    const reason = prompt('Rejection reason:');
    if (reason) {
      this.leaveService.approveRejectLeave({
        leaveId: leave._id,
        action: 'reject',
        reason
      }).subscribe({
        next: () => {
          this.loadPendingLeaves();
        },
        error: (error) => {
          console.error('Error rejecting leave:', error);
        }
      });
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  getStatusColor(status: string): string {
    const statusMap: Record<string, string> = {
      [LeaveStatus.PENDING]: 'status-warning',
      [LeaveStatus.APPROVED]: 'status-success',
      [LeaveStatus.REJECTED]: 'status-error'
    };
    return statusMap[status] || 'status-neutral';
  }
}
