import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { TimesheetStatus } from '../../../core/models/timesheet.model';
import dayjs from 'dayjs';

interface WeekSummary {
  weekStart: Date;
  weekEnd: Date;
  totalHours: number;
  billableHours: number;
  status: TimesheetStatus;
  submittedAt?: Date;
}

@Component({
  selector: 'app-timesheet-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './timesheet-history.component.html',
  styleUrl: './timesheet-history.component.scss'
})
export class TimesheetHistoryComponent implements OnInit {
  loading = signal(false);
  weekSummaries = signal<WeekSummary[]>([]);
  filteredSummaries = signal<WeekSummary[]>([]);
  
  // Filters
  statusFilter = signal<string>('all');
  startDateFilter = signal<Date | null>(null);
  endDateFilter = signal<Date | null>(null);
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalRecords = 0;
  
  displayedColumns = ['weekRange', 'totalHours', 'billableHours', 'status', 'submittedAt', 'actions'];
  
  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: TimesheetStatus.DRAFT, label: 'Draft' },
    { value: TimesheetStatus.SUBMITTED, label: 'Submitted' },
    { value: TimesheetStatus.APPROVED, label: 'Approved' },
    { value: TimesheetStatus.REJECTED, label: 'Rejected' }
  ];

  constructor(
    private timesheetService: TimesheetService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading.set(true);
    
    const params: any = {};
    if (this.startDateFilter()) {
      params.startDate = this.timesheetService.formatDate(this.startDateFilter()!);
    }
    if (this.endDateFilter()) {
      params.endDate = this.timesheetService.formatDate(this.endDateFilter()!);
    }
    if (this.statusFilter() !== 'all') {
      params.status = this.statusFilter();
    }

    this.timesheetService.getHistory(params).subscribe({
      next: (response: any) => {
        // Group entries by week
        const weekMap = new Map<string, WeekSummary>();
        
        response.data.forEach((entry: any) => {
          const weekKey = dayjs(entry.weekStartDate).format('YYYY-MM-DD');
          
          if (!weekMap.has(weekKey)) {
            weekMap.set(weekKey, {
              weekStart: dayjs(entry.weekStartDate).toDate(),
              weekEnd: dayjs(entry.weekEndDate).toDate(),
              totalHours: 0,
              billableHours: 0,
              status: entry.status,
              submittedAt: entry.submittedAt ? dayjs(entry.submittedAt).toDate() : undefined
            });
          }
          
          const week = weekMap.get(weekKey)!;
          week.totalHours += entry.hours;
          if (entry.isBillable) {
            week.billableHours += entry.hours;
          }
        });
        
        const summaries = Array.from(weekMap.values()).sort((a, b) => 
          dayjs(b.weekStart).unix() - dayjs(a.weekStart).unix()
        );
        
        this.weekSummaries.set(summaries);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load history:', error);
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = this.weekSummaries();
    
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(w => w.status === this.statusFilter());
    }
    
    if (this.startDateFilter()) {
      filtered = filtered.filter(w => w.weekStart >= this.startDateFilter()!);
    }
    
    if (this.endDateFilter()) {
      filtered = filtered.filter(w => w.weekEnd <= this.endDateFilter()!);
    }
    
    this.filteredSummaries.set(filtered);
    this.totalRecords = filtered.length;
  }

  onFilterChange() {
    this.pageIndex = 0;
    this.applyFilters();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getPaginatedData(): WeekSummary[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredSummaries().slice(start, end);
  }

  viewWeek(week: WeekSummary) {
    // Navigate to weekly grid with specific week
    const dateParam = this.timesheetService.formatDate(week.weekStart);
    console.log('Navigating to week:', week.weekStart, 'formatted as:', dateParam);
    this.router.navigate(['/employee/timesheets'], {
      queryParams: {
        date: dateParam
      }
    });
  }

  backToCurrent() {
    this.router.navigate(['/employee/timesheets']);
  }

  getStatusClass(status: TimesheetStatus): string {
    return status.toLowerCase();
  }
}
