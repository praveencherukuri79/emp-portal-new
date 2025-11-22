import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LeaveService } from '../../core/services/leave.service';
import { UINotificationService } from '../../core/services/notification.service';
import { LeaveType, LeaveRequest, LeaveBalance } from '../../core/models/leave.model';
import { LeaveType as SharedLeaveType } from '@shared/types';
import { getStatusColor } from '../../shared/utils/formatters';
import dayjs from 'dayjs';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './leave-management.component.html',
  styleUrl: './leave-management.component.scss'
})
export class LeaveManagementComponent implements OnInit {
  leaveForm!: FormGroup;
  balances = signal<LeaveBalance[]>([]);
  leaves = signal<LeaveRequest[]>([]);
  loading = signal(false);
  submitting = signal(false);

  leaveTypes = Object.values(SharedLeaveType);
  halfDayOptions: Array<'full_day' | 'morning' | 'afternoon'> = ['full_day', 'morning', 'afternoon'];
  displayedColumns = ['leaveType', 'dates', 'days', 'status', 'actions'];

  private uiNotification = inject(UINotificationService);

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadBalances();
    this.loadLeaves();
  }

  initForm() {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      halfDay: ['full_day', Validators.required],
      reason: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  loadBalances() {
    this.leaveService.getMyLeaveBalance().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          // Backend returns an object like { annual: {...}, sick: {...} }
          // Convert to array format
          const balanceArray: LeaveBalance[] = [];
          const balanceData: any = response.data;
          
          Object.keys(balanceData).forEach(key => {
            balanceArray.push({
              userId: '',
              tenantId: '',
              leaveType: key as LeaveType,
              totalDays: balanceData[key].total,
              usedDays: balanceData[key].used,
              remainingDays: balanceData[key].remaining,
              year: dayjs().year()
            });
          });
          
          this.balances.set(balanceArray);
        }
      },
      error: (err) => {
        console.error('Failed to load balances:', err);
        this.balances.set([]);
      }
    });
  }

  loadLeaves() {
    this.loading.set(true);
    this.leaveService.getMyLeaveRequests().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.leaves.set(response.data);
        } else {
          this.leaves.set([]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load leaves:', err);
        this.leaves.set([]);
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.leaveForm.invalid) return;

    this.submitting.set(true);
    const formValue = this.leaveForm.value;

    this.leaveService.createLeaveRequest({
      leaveType: formValue.leaveType,
      startDate: this.formatDate(formValue.startDate),
      endDate: this.formatDate(formValue.endDate),
      isHalfDay: formValue.halfDay !== 'full_day',
      halfDayPeriod: formValue.halfDay !== 'full_day' ? (formValue.halfDay as 'morning' | 'afternoon') : undefined,
      reason: formValue.reason
    }).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.submitting.set(false);
          this.leaveForm.reset({ halfDay: 'full_day' });
          this.loadBalances();
          this.loadLeaves();
          this.uiNotification.showSuccess('Leave request submitted successfully!');
        } else {
          this.submitting.set(false);
          this.uiNotification.showError('Failed to submit leave request. Please try again.');
        }
      },
      error: (err) => {
        console.error('Failed to create leave request:', err);
        this.submitting.set(false);
        this.uiNotification.showError('Failed to submit leave request. Please try again.');
      }
    });
  }

  async cancelLeave(leave: LeaveRequest) {
    if (!leave._id || leave.status !== 'pending') return;

    const confirmed = await this.uiNotification.confirm({
      title: 'Cancel Leave Request',
      message: 'Are you sure you want to cancel this leave request?',
      confirmText: 'Cancel Leave',
      cancelText: 'Keep Request',
      confirmColor: 'warn'
    });

    if (!confirmed) return;

    this.leaveService.cancelLeaveRequest(leave._id, undefined).subscribe({
      next: () => {
        this.loadLeaves();
        this.loadBalances();
        this.uiNotification.showSuccess('Leave request cancelled successfully');
      },
      error: () => {
        this.uiNotification.showError('Failed to cancel leave request');
      }
    });
  }

  formatDate(date: Date): string {
    return dayjs(date).format('YYYY-MM-DD');
  }

  getStatusColor(status: string): string {
    const color = getStatusColor(status);
    const colorMap: Record<string, string> = {
      'primary': 'success',
      'accent': 'warning',
      'warn': 'error',
      '': 'default'
    };
    return colorMap[color] || 'default';
  }

  getUsagePercentage(balance: LeaveBalance): number {
    return (balance.usedDays / balance.totalDays) * 100;
  }
}

