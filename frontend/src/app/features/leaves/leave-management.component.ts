import { Component, OnInit, signal } from '@angular/core';
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
import { LeaveType, LeaveRequest, LeaveBalance, HalfDayPeriod } from '../../core/models/leave.model';
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

  leaveTypes = Object.values(LeaveType);
  halfDayOptions = Object.values(HalfDayPeriod);
  displayedColumns = ['leaveType', 'dates', 'days', 'status', 'actions'];

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
      halfDay: [HalfDayPeriod.FULL_DAY, Validators.required],
      reason: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  loadBalances() {
    this.leaveService.getMyBalances().subscribe({
      next: (response) => {
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
      },
      error: () => console.error('Failed to load balances')
    });
  }

  loadLeaves() {
    this.loading.set(true);
    this.leaveService.getMyLeaves().subscribe({
      next: (response) => {
        this.leaves.set(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
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
      isHalfDay: formValue.halfDay !== HalfDayPeriod.FULL_DAY,
      halfDayPeriod: formValue.halfDay !== HalfDayPeriod.FULL_DAY ? formValue.halfDay : undefined,
      reason: formValue.reason
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.leaveForm.reset({ halfDay: HalfDayPeriod.FULL_DAY });
        this.loadBalances();
        this.loadLeaves();
      },
      error: () => this.submitting.set(false)
    });
  }

  cancelLeave(leave: LeaveRequest) {
    if (!leave._id || leave.status !== 'pending') return;

    this.leaveService.cancelLeave(leave._id).subscribe({
      next: () => this.loadLeaves(),
      error: () => console.error('Failed to cancel leave')
    });
  }

  formatDate(date: Date): string {
    return dayjs(date).format('YYYY-MM-DD');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  }

  getUsagePercentage(balance: LeaveBalance): number {
    return (balance.usedDays / balance.totalDays) * 100;
  }
}
