import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { UINotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TimesheetStatus } from '../../../core/models/timesheet.model';
import {
  IProjectResponse,
  IProjectsListResponse,
  ITimesheetEntryResponse,
  IWeeklyTimesheetResponse
} from '@shared/types/responses';
import { IBatchTimesheetEntriesRequest } from '@shared/types/requests';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

/**
 * Project entry for the weekly grid
 * Represents a project with hours tracked across 7 days
 */
interface IWeeklyProjectEntry {
  projectId: string;
  projectName: string;
  description: string;
  billable: boolean;
  hours: number[]; // 7 days (Mon-Sun)
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
    MatChipsModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './weekly-grid.component.html',
  styleUrl: './weekly-grid.component.scss'
})
export class WeeklyGridComponent implements OnInit {
  private timesheetService = inject(TimesheetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private uiNotification = inject(UINotificationService);

  loading = signal(false);
  weekStart = signal<Date>(new Date());
  weekEnd = signal<Date>(new Date());
  projects = signal<IProjectResponse[]>([]);
  weekDays = signal<Date[]>([]);
  weekStatus = signal<TimesheetStatus>(TimesheetStatus.DRAFT);
  
  // Project-based entries for the grid
  projectEntries = signal<IWeeklyProjectEntry[]>([]);
  
  // Add project controls
  selectedProject = signal<string>('');
  projectBillable = signal<boolean>(true);
  
  // Available projects (not yet added to timesheet)
  availableProjects = computed(() => {
    const addedProjectIds = this.projectEntries().map(pe => pe.projectId);
    return this.projects().filter(p => !addedProjectIds.includes(p._id) && p.isActive);
  });


  ngOnInit() {
    // Subscribe to query param changes to handle navigation from history
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        // Parse date string using dayjs to handle YYYY-MM-DD format correctly
        const parsedDate = dayjs(params['date']);
        if (parsedDate.isValid()) {
          this.loadSpecificWeek(parsedDate.toDate());
        } else {
          console.warn('Invalid date parameter, loading current week instead');
          this.loadCurrentWeek();
        }
      } else {
        this.loadCurrentWeek();
      }
    });
    
    this.loadProjects();
  }

  loadSpecificWeek(date: Date) {
    // The date passed from history is already the week start (Monday)
    // Use Day.js to ensure Monday as week start and handle timezone correctly
    const monday = dayjs(date).startOf('isoWeek');
    const sunday = monday.add(6, 'days').endOf('day');

    this.weekStart.set(monday.toDate());
    this.weekEnd.set(sunday.toDate());
    this.generateWeekDays();
    this.loadWeekEntries();
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
    const start = dayjs(this.weekStart());
    
    for (let i = 0; i < 7; i++) {
      days.push(start.add(i, 'days').toDate());
    }
    
    this.weekDays.set(days);
  }

  loadProjects(): void {
    this.timesheetService.getProjects().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          // response.data is IProjectsListResponse which has 'projects' array
          const projectsData: IProjectsListResponse = response.data;
          const allProjects = projectsData.projects || [];
          
          // Filter for active projects only
          const activeProjects = allProjects.filter((p: IProjectResponse) => p.isActive);
          
          this.projects.set(activeProjects);
          
          // Show warning only if no projects are assigned
          if (activeProjects.length === 0) {
            this.showError('No projects assigned. Please contact your administrator to assign projects.');
          }
        } else {
          this.projects.set([]);
          this.showError('No projects assigned.');
        }
      },
      error: (error) => {
        console.error('Failed to load projects:', error);
        this.projects.set([]);
        this.showError('Failed to load projects. Please try again later.');
      }
    });
  }

  loadWeekEntries(): void {
    this.loading.set(true);
    const start = this.timesheetService.formatDate(this.weekStart());

    this.timesheetService.getWeeklyEntries(start).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const weekData = response.data as IWeeklyTimesheetResponse;
          this.weekStatus.set(weekData.status || TimesheetStatus.DRAFT);
          this.convertEntriesToGrid(weekData.entries || []);
        } else {
          this.weekStatus.set(TimesheetStatus.DRAFT);
          this.projectEntries.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load week entries:', error);
        this.weekStatus.set(TimesheetStatus.DRAFT);
        this.projectEntries.set([]);
        this.showError('Failed to load timesheet entries');
        this.loading.set(false);
      }
    });
  }

  convertEntriesToGrid(entries: ITimesheetEntryResponse[]): void {
    // Group entries by project
    const projectMap = new Map<string, IWeeklyProjectEntry>();
    
    entries.forEach((entry) => {
      // Get project ID (handle both 'project' and 'projectId' fields)
      const projectId = entry.projectId || entry.project;
      if (!projectId) {
        console.warn('Entry has no project ID:', entry);
        return;
      }
      
      // Parse date using dayjs
      const entryDate = dayjs(entry.date);
      const dayIndex = this.weekDays().findIndex(day => 
        dayjs(day).format('YYYY-MM-DD') === entryDate.format('YYYY-MM-DD')
      );
      
      if (dayIndex === -1) {
        console.warn(`Entry date ${entryDate.format('YYYY-MM-DD')} not in current week`);
        return;
      }
      
      // Find project details from loaded projects list
      const project = this.projects().find(p => p._id === projectId);
      const projectName = project?.name || entry.project || 'Unknown Project';
      
      // Create new project entry if it doesn't exist
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          projectId,
          projectName,
          description: entry.description || '',
          billable: entry.isBillable,
          hours: [0, 0, 0, 0, 0, 0, 0]
        });
      }
      
      // Add hours to the appropriate day
      const projectEntry = projectMap.get(projectId)!;
      projectEntry.hours[dayIndex] += entry.hours || 0;
      
      // Update description and billable if provided
      if (entry.description && !projectEntry.description) {
        projectEntry.description = entry.description;
      }
    });
    
    this.projectEntries.set(Array.from(projectMap.values()));
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

  viewHistory() {
    this.router.navigate(['/employee/timesheets/history']);
  }

  addProject(): void {
    const projectId = this.selectedProject();
    
    if (!projectId) {
      this.showError('Please select a project');
      return;
    }
    
    // Find selected project from loaded projects
    const project = this.projects().find(p => p._id === projectId);
    if (!project) {
      this.showError('Selected project not found');
      return;
    }
    
    // Check if project already added
    if (this.projectEntries().some(e => e.projectId === projectId)) {
      this.showError('Project already added to this timesheet');
      return;
    }
    
    const newEntry: IWeeklyProjectEntry = {
      projectId,
      projectName: project.name,
      description: project.description || '',
      billable: this.projectBillable(),
      hours: [0, 0, 0, 0, 0, 0, 0]
    };
    
    this.projectEntries.update(entries => [...entries, newEntry]);
    
    // Reset form controls
    this.selectedProject.set('');
    this.projectBillable.set(true);
    
    this.showSuccess(`"${project.name}" added to timesheet`);
  }

  async removeProject(projectId: string): Promise<void> {
    const confirmed = await this.uiNotification.confirm({
      title: 'Remove Project',
      message: 'Remove this project from the timesheet? All hours will be lost.',
      confirmText: 'Remove',
      cancelText: 'Keep',
      confirmColor: 'warn'
    });

    if (!confirmed) return;
    
    this.projectEntries.update(entries => 
      entries.filter(e => e.projectId !== projectId)
    );
    
    this.showSuccess('Project removed from timesheet');
  }

  onHoursChange(projectId: string, dayIndex: number): void {
    const entry = this.projectEntries().find(e => e.projectId === projectId);
    if (!entry) return;
    
    // Validate hours (0-24 range)
    if (entry.hours[dayIndex] < 0) {
      entry.hours[dayIndex] = 0;
    }
    if (entry.hours[dayIndex] > 24) {
      entry.hours[dayIndex] = 24;
    }
  }

  getProjectTotal(projectEntry: IWeeklyProjectEntry): number {
    return projectEntry.hours.reduce((sum, hours) => sum + (hours || 0), 0);
  }

  getDayTotal(dayIndex: number): number {
    return this.projectEntries().reduce((sum, entry) => sum + (entry.hours[dayIndex] || 0), 0);
  }

  getTotalWeekHours(): number {
    return this.projectEntries().reduce((sum, entry) => 
      sum + entry.hours.reduce((daySum, hours) => daySum + (hours || 0), 0), 0
    );
  }

  getBillableHours(): number {
    return this.projectEntries()
      .filter(entry => entry.billable)
      .reduce((sum, entry) => 
        sum + entry.hours.reduce((daySum, hours) => daySum + (hours || 0), 0), 0
      );
  }

  canEdit(): boolean {
    return this.weekStatus() === TimesheetStatus.DRAFT || this.weekStatus() === TimesheetStatus.REJECTED;
  }

  saveDraft() {
    if (this.projectEntries().length === 0) {
      this.showError('No projects to save');
      return;
    }

    this.loading.set(true);
    this.saveAllEntries(TimesheetStatus.DRAFT);
  }

  async submitWeek(): Promise<void> {
    // Validate projects are assigned
    if (this.projects().length === 0) {
      this.showError('No projects assigned. Please contact your administrator.');
      return;
    }

    // Validate hours entered
    if (this.projectEntries().length === 0 || this.getTotalWeekHours() === 0) {
      this.showError('Please add hours before submitting');
      return;
    }

    const confirmed = await this.uiNotification.confirm({
      title: 'Submit Timesheet',
      message: 'Submit this week for approval? You won\'t be able to edit after submission.',
      confirmText: 'Submit',
      cancelText: 'Cancel',
      confirmColor: 'primary'
    });

    if (!confirmed) return;

    this.loading.set(true);
    this.saveAllEntries(TimesheetStatus.SUBMITTED);
  }

  resubmitWeek(): void {
    this.submitWeek();
  }

  private saveAllEntries(status: TimesheetStatus): void {
    // Convert grid entries to batch request format
    const entries: IBatchTimesheetEntriesRequest['entries'] = [];
    
    this.projectEntries().forEach(projectEntry => {
      projectEntry.hours.forEach((hours, dayIndex) => {
        if (hours > 0) {
          const day = this.weekDays()[dayIndex];
          entries.push({
            date: this.timesheetService.formatDate(day),
            project: projectEntry.projectId,
            description: projectEntry.description,
            hours,
            isBillable: projectEntry.billable
          });
        }
      });
    });

    if (entries.length === 0) {
      this.showError('No hours entered');
      this.loading.set(false);
      return;
    }

    // Create/update all entries
    this.timesheetService.batchCreateEntries(entries).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          if (status === TimesheetStatus.SUBMITTED) {
            // Submit the week for approval
            const weekStartDate = this.timesheetService.formatDate(this.weekStart());
            this.timesheetService.submitWeek(weekStartDate).subscribe({
              next: (submitResponse) => {
                if (submitResponse.status === 'success') {
                  this.showSuccess('Timesheet submitted successfully!');
                  this.loadWeekEntries();
                } else {
                  this.showError(submitResponse.message || 'Failed to submit timesheet');
                  this.loading.set(false);
                }
              },
              error: (error) => {
                console.error('Failed to submit week:', error);
                this.showError(error.error?.message || 'Failed to submit timesheet');
                this.loading.set(false);
              }
            });
          } else {
            this.showSuccess('Timesheet saved as draft');
            this.loadWeekEntries();
          }
        } else {
          this.showError(response.message || 'Failed to save timesheet');
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('Failed to save entries:', error);
        this.showError(error.error?.message || 'Failed to save timesheet');
        this.loading.set(false);
      }
    });
  }

  private showSuccess(message: string) {
    this.uiNotification.showSuccess(message);
  }

  private showError(message: string) {
    this.uiNotification.showError(message);
  }

  getStatusIcon(status: TimesheetStatus): string {
    switch (status) {
      case TimesheetStatus.DRAFT:
        return 'edit';
      case TimesheetStatus.SUBMITTED:
        return 'send';
      case TimesheetStatus.APPROVED:
        return 'check_circle';
      case TimesheetStatus.REJECTED:
        return 'cancel';
      default:
        return 'info';
    }
  }
}

