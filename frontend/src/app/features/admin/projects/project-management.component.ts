import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectService, ProjectCreateRequest, ProjectUpdateRequest } from '../../../services/project.service';
import { IProjectResponse } from '@shared/types/responses';
import { ValidatorsUtil } from '../../../shared/utils/validators.util';
import { DateHelper } from '../../../shared/utils/date-helper.util';
import { ToastService } from '../../../shared/components/toast-notification/toast-notification.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="project-management-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-actions">
              <h2>Project Management</h2>
              <button mat-raised-button color="primary" (click)="openCreateDialog()">
                <mat-icon>add</mat-icon>
                Create Project
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Search and Filter -->
          <div class="filter-section">
            <mat-form-field appearance="outline">
              <mat-label>Search projects</mat-label>
              <input matInput (keyup)="onSearch($event)" placeholder="Search by name or code">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status Filter</mat-label>
              <mat-select (selectionChange)="onFilterChange()">
                <mat-option value="all">All Projects</mat-option>
                <mat-option value="true">Active Only</mat-option>
                <mat-option value="false">Inactive Only</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Projects Table -->
          @if (loading()) {
            <div class="loading">Loading projects...</div>
          } @else if (projects().length === 0) {
            <div class="empty-state">
              <mat-icon>work_off</mat-icon>
              <p>No projects found</p>
              <button mat-raised-button color="primary" (click)="openCreateDialog()">
                Create First Project
              </button>
            </div>
          } @else {
            <table mat-table [dataSource]="projects()" class="projects-table">
              <!-- Code Column -->
              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef>Code</th>
                <td mat-cell *matCellDef="let project">
                  <mat-chip [color]="project.isActive ? 'primary' : 'default'">
                    {{ project.code }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Project Name</th>
                <td mat-cell *matCellDef="let project">{{ project.name }}</td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let project">
                  {{ project.description || '-' }}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let project">
                  <mat-chip [color]="project.isActive ? 'primary' : 'warn'">
                    {{ project.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let project">
                  <button mat-icon-button [matTooltip]="'Edit'" (click)="openEditDialog(project)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button [matTooltip]="project.isActive ? 'Archive' : 'Archived'" 
                          (click)="archiveProject(project)" 
                          [disabled]="!project.isActive"
                          color="warn">
                    <mat-icon>{{ project.isActive ? 'archive' : 'unarchive' }}</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .project-management-container {
      padding: 24px;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .filter-section {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .filter-section mat-form-field {
      flex: 1;
      max-width: 300px;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 48px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .projects-table {
      width: 100%;
    }

    mat-chip {
      font-size: 12px;
    }
  `]
})
export class ProjectManagementComponent implements OnInit {
  private projectService = inject(ProjectService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  projects = signal<IProjectResponse[]>([]);
  loading = signal(false);
  searchTerm = signal('');
  activeFilter = signal<boolean | undefined>(undefined);

  displayedColumns = ['code', 'name', 'description', 'status', 'actions'];

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.projectService.getAllProjects({
      isActive: this.activeFilter(),
      search: this.searchTerm() || undefined
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.projects.set(response.data.projects);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.toast.error('Failed to load projects');
        this.loading.set(false);
      }
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.loadProjects();
  }

  onFilterChange(): void {
    this.loadProjects();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  openEditDialog(project: IProjectResponse): void {
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', project }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  archiveProject(project: IProjectResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Archive Project',
        message: `Are you sure you want to archive project "${project.name}"? This cannot be undone.`,
        confirmText: 'Archive',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.projectService.archiveProject(project._id).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.toast.success('Project archived successfully');
              this.loadProjects();
            }
          },
          error: () => {
            this.toast.error('Failed to archive project');
          }
        });
      }
    });
  }
}

/**
 * Project Form Dialog Component
 */
@Component({
  selector: 'app-project-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create' : 'Edit' }} Project</h2>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Project Code *</mat-label>
            <input matInput formControlName="code" placeholder="PROJ001" [readonly]="data.mode === 'edit'">
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Project code is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Project Name *</mat-label>
            <input matInput formControlName="name" placeholder="Enter project name">
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <mat-error>Project name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Client Name</mat-label>
            <input matInput formControlName="clientName">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="active">Active</mat-option>
              <mat-option value="completed">Completed</mat-option>
              <mat-option value="on-hold">On Hold</mat-option>
              <mat-option value="cancelled">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input matInput type="date" formControlName="startDate">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>End Date</mat-label>
            <input matInput type="date" formControlName="endDate">
            @if (form.hasError('dateRange')) {
              <mat-error>End date must be after start date</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Budget</mat-label>
            <input matInput type="number" formControlName="budget" placeholder="0">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Currency</mat-label>
            <mat-select formControlName="currency">
              <mat-option value="USD">USD</mat-option>
              <mat-option value="EUR">EUR</mat-option>
              <mat-option value="GBP">GBP</mat-option>
              <mat-option value="INR">INR</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
          @if (submitting()) {
            <mat-icon>hourglass_empty</mat-icon>
          }
          {{ data.mode === 'create' ? 'Create' : 'Update' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 16px 0;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-dialog-content {
      min-width: 500px;
      max-height: 70vh;
      overflow-y: auto;
    }
  `]
})
export class ProjectFormDialogComponent {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private toast = inject(ToastService);
  private dialogRef = inject(MatDialog);

  data: { mode: 'create' | 'edit'; project?: IProjectResponse } = { mode: 'create' };
  submitting = signal(false);

  form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    clientName: [''],
    status: ['active'],
    startDate: [''],
    endDate: [''],
    budget: [0, [Validators.min(0)]],
    currency: ['USD']
  }, {
    validators: ValidatorsUtil.dateRange('startDate', 'endDate')
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.project) {
      this.form.patchValue(this.data.project);
      this.form.get('code')?.disable(); // Code cannot be changed after creation
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.getRawValue();

    if (this.data.mode === 'create') {
      const request: ProjectCreateRequest = formValue;
      this.projectService.createProject(request).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.toast.success('Project created successfully');
            this.dialogRef.closeAll();
          }
        },
        error: (error) => {
          this.toast.error(error.message || 'Failed to create project');
          this.submitting.set(false);
        }
      });
    } else {
      const request: ProjectUpdateRequest = formValue;
      this.projectService.updateProject(this.data.project!._id, request).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.toast.success('Project updated successfully');
            this.dialogRef.closeAll();
          }
        },
        error: (error) => {
          this.toast.error(error.message || 'Failed to update project');
          this.submitting.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.closeAll();
  }
}

