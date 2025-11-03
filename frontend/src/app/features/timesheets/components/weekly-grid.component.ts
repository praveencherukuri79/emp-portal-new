import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TimesheetEntry, TimesheetStatus, Project } from '../../../core/models/timesheet.model';

interface DayEntry {
  date: Date;
  dayName: string;
  entry: TimesheetEntry | null;
  hours: number;
}

@Component({
  selector: 'app-weekly-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatCheckboxModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './weekly-grid.component.html',
  styleUrl: './weekly-grid.component.scss'
})
export class WeeklyGridComponent implements OnInit {
  loading = signal(false);
  weekStart = signal<Date>(new Date());
  weekEnd = signal<Date>(new Date());
  projects = signal<Project[]>([]);
  weekDays = signal<Date[]>([]);
  entries = signal<TimesheetEntry[]>([]);
  weekStatus = signal<TimesheetStatus>(TimesheetStatus.DRAFT);
  
  // Quick entry form
  selectedProject = signal<string>('');
  quickHours: number[] = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
  quickDescription = signal<string>('');
  quickBillable = signal<boolean>(true);

  constructor(private timesheetService: TimesheetService) {}

  ngOnInit() {
    this.loadCurrentWeek();
    this.loadProjects();
  }

  loadCurrentWeek() {
    const { start, end } = this.timesheetService.getCurrentWeekRange();
    this.weekStart.set(start);
    this.weekEnd.set(end);
    this.generateWeekDays();
    this.loadWeekEntries();
  }

  generateWeekDays() {
    const days: Date[] = [];
    const start = new Date(this.weekStart());
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    this.weekDays.set(days);
  }

  loadProjects() {
    this.timesheetService.getProjects().subscribe({
      next: (response) => {
        this.projects.set(response.data.filter(p => p.isActive));
      },
      error: (error) => {
        console.error('Failed to load projects:', error);
      }
    });
  }

  loadWeekEntries() {
    this.loading.set(true);
    const start = this.timesheetService.formatDate(this.weekStart());
    const end = this.timesheetService.formatDate(this.weekEnd());

    this.timesheetService.getWeeklyEntries(start, end).subscribe({
      next: (response) => {
        this.entries.set(response.data.entries);
        this.weekStatus.set(response.data.status);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load week entries:', error);
        this.loading.set(false);
      }
    });
  }

  previousWeek() {
    const { start, end } = this.timesheetService.getPreviousWeek(this.weekStart());
    this.weekStart.set(start);
    this.weekEnd.set(end);
    this.generateWeekDays();
    this.loadWeekEntries();
  }

  nextWeek() {
    const { start, end } = this.timesheetService.getNextWeek(this.weekStart());
    this.weekStart.set(start);
    this.weekEnd.set(end);
    this.generateWeekDays();
    this.loadWeekEntries();
  }

  goToCurrentWeek() {
    this.loadCurrentWeek();
  }

  getEntriesForDay(date: Date): TimesheetEntry[] {
    const dateStr = this.timesheetService.formatDate(date);
    return this.entries().filter(entry => {
      const entryDate = this.timesheetService.formatDate(new Date(entry.date));
      return entryDate === dateStr;
    });
  }

  getTotalHoursForDay(date: Date): number {
    return this.getEntriesForDay(date).reduce((sum, entry) => sum + entry.hours, 0);
  }

  getTotalWeekHours(): number {
    return this.entries().reduce((sum, entry) => sum + entry.hours, 0);
  }

  getBillableHours(): number {
    return this.entries().filter(e => e.billable).reduce((sum, entry) => sum + entry.hours, 0);
  }

  canEdit(): boolean {
    return this.weekStatus() === TimesheetStatus.DRAFT || this.weekStatus() === TimesheetStatus.REJECTED;
  }

  saveQuickEntry() {
    if (!this.selectedProject() || this.quickHours.every(h => h === 0)) {
      alert('Please select a project and enter hours for at least one day');
      return;
    }

    this.loading.set(true);
    const requests = this.quickHours.map((hours, index) => {
      if (hours > 0) {
        const date = this.weekDays()[index];
        return this.timesheetService.createEntry({
          date: this.timesheetService.formatDate(date),
          projectId: this.selectedProject(),
          hours: hours,
          description: this.quickDescription(),
          billable: this.quickBillable()
        });
      }
      return null;
    }).filter(req => req !== null);

    // Execute all requests
    Promise.all(requests.map(req => req!.toPromise()))
      .then(() => {
        this.resetQuickEntry();
        this.loadWeekEntries();
      })
      .catch(error => {
        console.error('Failed to save entries:', error);
        this.loading.set(false);
      });
  }

  resetQuickEntry() {
    this.selectedProject.set('');
    this.quickHours = [0, 0, 0, 0, 0, 0, 0];
    this.quickDescription.set('');
    this.quickBillable.set(true);
  }

  deleteEntry(entryId: string | undefined) {
    if (!entryId || !confirm('Are you sure you want to delete this entry?')) return;

    this.timesheetService.deleteEntry(entryId).subscribe({
      next: () => {
        this.loadWeekEntries();
      },
      error: (error) => {
        console.error('Failed to delete entry:', error);
      }
    });
  }

  submitWeek() {
    if (this.entries().length === 0) {
      alert('No entries to submit');
      return;
    }

    if (!confirm('Submit this week for approval? You won\'t be able to edit it after submission.')) {
      return;
    }

    const entryIds = this.entries().map(e => e._id!).filter(id => id);
    this.loading.set(true);

    this.timesheetService.submitWeek({
      weekStart: this.timesheetService.formatDate(this.weekStart()),
      weekEnd: this.timesheetService.formatDate(this.weekEnd()),
      entryIds
    }).subscribe({
      next: () => {
        this.loadWeekEntries();
      },
      error: (error) => {
        console.error('Failed to submit week:', error);
        this.loading.set(false);
      }
    });
  }

  getStatusColor(status: TimesheetStatus): string {
    switch (status) {
      case TimesheetStatus.DRAFT: return 'accent';
      case TimesheetStatus.SUBMITTED: return 'primary';
      case TimesheetStatus.APPROVED: return 'success';
      case TimesheetStatus.REJECTED: return 'warn';
      default: return 'accent';
    }
  }
}
