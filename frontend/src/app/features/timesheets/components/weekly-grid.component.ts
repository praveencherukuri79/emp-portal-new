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
import { TimesheetEntry, TimesheetStatus, Project } from '../../../core/models/timesheet.model';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
interface ProjectEntry {
  projectId: string;
  projectName: string;
  description: string;
  billable: boolean;
  hours: number[]; // 7 days
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
  loading = signal(false);
  weekStart = signal<Date>(new Date());
  weekEnd = signal<Date>(new Date());
  projects = signal<Project[]>([]);
  weekDays = signal<Date[]>([]);
  weekStatus = signal<TimesheetStatus>(TimesheetStatus.DRAFT);
  
  // Project-based entries for the grid
  projectEntries = signal<ProjectEntry[]>([]);
  
  // Add project controls
  selectedProject = signal<string>('');
  projectDescription = signal<string>('');
  projectBillable = signal<boolean>(true);
  
  // Available projects (not yet added to timesheet)
  availableProjects = computed(() => {
    const addedProjectIds = this.projectEntries().map(pe => pe.projectId);
    return this.projects().filter(p => !addedProjectIds.includes(p._id) && p.isActive);
  });

  private uiNotification = inject(UINotificationService);

  constructor(
    private timesheetService: TimesheetService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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

  loadProjects() {
    this.timesheetService.getProjects().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const activeProjects = response.data.filter((p: any) => p.isActive);
          this.projects.set(activeProjects);
          
          // Show warning if no projects are assigned
          if (activeProjects.length === 0) {
            this.showError('No projects assigned. Please contact your administrator to assign projects before creating timesheets.');
          }
        } else {
          this.projects.set([]);
          this.showError('No projects assigned. Please contact your administrator to assign projects before creating timesheets.');
        }
      },
      error: (error) => {
        console.error('Failed to load projects:', error);
        this.projects.set([]);
        this.showError('Failed to load projects. Please contact your administrator to assign projects before creating timesheets.');
      }
    });
  }

  loadWeekEntries() {
    this.loading.set(true);
    const start = this.timesheetService.formatDate(this.weekStart());

    this.timesheetService.getWeeklyEntries(start).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          // Backend returns entries directly in response.data, not response.data.entries
          const weekData = response.data;
          this.weekStatus.set(weekData.status || TimesheetStatus.DRAFT);
          
          // Entries are in weekData.entries
          this.convertEntriesToGrid(weekData.entries || []);
        } else {
          this.weekStatus.set(TimesheetStatus.DRAFT);
          this.projectEntries.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load week entries:', error);
        // Set default status to DRAFT on error
        this.weekStatus.set(TimesheetStatus.DRAFT);
        this.projectEntries.set([]);
        this.showError('Failed to load timesheet entries');
        this.loading.set(false);
      }
    });
  }

  convertEntriesToGrid(entries: any[]) {
    // Group entries by project
    const projectMap = new Map<string, ProjectEntry>();
    
    entries.forEach((entry, index) => {
      // Backend model uses 'project' field for project ID/name
      const projectId = entry.project;
      if (!projectId) {
        console.warn(`Entry at index ${index} has no project field:`, entry);
        return;
      }
      
      // Parse date using dayjs to handle both Date objects and date strings correctly
      const entryDate = dayjs(entry.date);
      const dayIndex = this.weekDays().findIndex(day => {
        const dayStr = dayjs(day).format('YYYY-MM-DD');
        const entryStr = entryDate.format('YYYY-MM-DD');
        return dayStr === entryStr;
      });
      
      if (dayIndex === -1) {
        console.warn(`Entry date ${entryDate.format('YYYY-MM-DD')} not found in week days`);
        return;
      }
      
      // Find project name from projects list if available
      const project = this.projects().find(p => p._id === projectId || p.name === projectId);
      const projectName = project ? project.name : (entry.task || entry.project || 'Unnamed Project');
      
      // Create new project entry if it doesn't exist
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          projectId: projectId,
          projectName: projectName,
          description: entry.description || '',
          billable: entry.isBillable !== undefined ? entry.isBillable : true,
          hours: [0, 0, 0, 0, 0, 0, 0]
        });
      }
      
      // Add hours to the appropriate day
      const projectEntry = projectMap.get(projectId)!;
      projectEntry.hours[dayIndex] += entry.hours || 0; // Use += in case multiple entries per day
    });
    
    const projectEntries = Array.from(projectMap.values());
    this.projectEntries.set(projectEntries);
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

  addProject() {
    const projectId = this.selectedProject();
    
    if (!projectId) {
      this.showError('Please select a project from the list');
      return;
    }
    
    // Find selected project
    const project = this.projects().find(p => p._id === projectId);
    if (!project) {
      this.showError('Selected project not found');
      return;
    }
    
    // Check if project already added
    if (this.projectEntries().some(e => e.projectId === projectId)) {
      this.showError('This project is already added to the timesheet');
      return;
    }
    
    const newEntry: ProjectEntry = {
      projectId: projectId,
      projectName: project.name,
      description: this.projectDescription(),
      billable: this.projectBillable(),
      hours: [0, 0, 0, 0, 0, 0, 0]
    };
    
    this.projectEntries.update(entries => [...entries, newEntry]);
    
    // Reset form
    this.selectedProject.set('');
    this.projectDescription.set('');
    this.projectBillable.set(true);
    
    this.showSuccess(`"${project.name}" added to timesheet`);
  }

  async removeProject(projectId: string) {
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
    
    this.showSuccess('Project removed');
  }

  onHoursChange(projectId: string, dayIndex: number) {
    // Validation is handled by the input element, but we could add additional logic here
    const entry = this.projectEntries().find(e => e.projectId === projectId);
    if (entry && entry.hours[dayIndex] < 0) {
      entry.hours[dayIndex] = 0;
    }
    if (entry && entry.hours[dayIndex] > 24) {
      entry.hours[dayIndex] = 24;
    }
  }

  getProjectTotal(projectEntry: ProjectEntry): number {
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

  async submitWeek() {
    // Check if user has any assigned projects
    if (this.projects().length === 0) {
      this.showError('No projects assigned. Please contact your administrator to assign projects before submitting timesheets.');
      return;
    }

    if (this.projectEntries().length === 0 || this.getTotalWeekHours() === 0) {
      this.showError('Please add hours before submitting');
      return;
    }

    const confirmed = await this.uiNotification.confirm({
      title: 'Submit Timesheet',
      message: 'Submit this week for approval? You won\'t be able to edit it after submission.',
      confirmText: 'Submit',
      cancelText: 'Cancel',
      confirmColor: 'primary'
    });

    if (!confirmed) return;

    this.loading.set(true);
    this.saveAllEntries(TimesheetStatus.SUBMITTED);
  }

  resubmitWeek() {
    this.submitWeek();
  }

  private saveAllEntries(status: TimesheetStatus) {
    // Convert grid entries to individual timesheet entries
    const entries: any[] = [];
    
    this.projectEntries().forEach(projectEntry => {
      projectEntry.hours.forEach((hours, dayIndex) => {
        if (hours > 0) {
          const day = this.weekDays()[dayIndex];
          entries.push({
            date: this.timesheetService.formatDate(day),
            project: projectEntry.projectId,  // Backend expects 'project' field (handles projectId too)
            projectId: projectEntry.projectId,  // Also send projectId for compatibility
            hours: hours,
            description: projectEntry.description,
            billable: projectEntry.billable,
            isBillable: projectEntry.billable  // Backend expects isBillable
          });
        }
      });
    });

    if (entries.length === 0) {
      this.showError('No hours entered');
      this.loading.set(false);
      return;
    }

    // First, create/update all entries as DRAFT
    this.timesheetService.batchCreateEntries(entries).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          if (status === TimesheetStatus.SUBMITTED) {
            // Then submit the week (changes DRAFT to SUBMITTED)
            const weekStartDate = this.timesheetService.formatDate(this.weekStart());
            this.timesheetService.submitWeek(weekStartDate).subscribe({
              next: (submitResponse) => {
                if (submitResponse.status === 'success') {
                  this.showSuccess('Timesheet submitted successfully!');
                  this.loadWeekEntries();
                } else {
                  this.showError('Failed to submit timesheet');
                  this.loading.set(false);
                }
              },
              error: (error) => {
                console.error('Failed to submit week:', error);
                this.showError('Failed to submit timesheet');
                this.loading.set(false);
              }
            });
          } else {
            this.showSuccess('Timesheet saved as draft');
            this.loadWeekEntries();
          }
        } else {
          this.showError('Failed to save timesheet entries');
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('Failed to save entries:', error);
        this.showError('Failed to save timesheet');
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
