import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User, UserRole } from '../../../core/models/user.model';
import { EmploymentType } from '@shared/types';
import { ROLE_LABELS, EMPLOYMENT_TYPE_LABELS } from '@shared/types/constants';

@Component({
  selector: 'app-employee-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>edit</mat-icon>
        Edit Employee
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" class="edit-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName">
              <mat-error>First name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName">
              <mat-error>Last name is required</mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
              <mat-error>Valid email is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber">
            </mat-form-field>
          </div>
        </div>

        <div class="form-section">
          <h3>Employment Details</h3>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Employee ID</mat-label>
              <input matInput formControlName="employeeId">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <input matInput formControlName="department">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Designation</mat-label>
              <input matInput formControlName="designation">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Employment Type</mat-label>
              <mat-select formControlName="employmentType">
                @for (type of employmentTypes; track type.value) {
                  <mat-option [value]="type.value">{{ type.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Date of Joining</mat-label>
              <input matInput [matDatepicker]="joiningPicker" formControlName="dateOfJoining">
              <mat-datepicker-toggle matSuffix [for]="joiningPicker"></mat-datepicker-toggle>
              <mat-datepicker #joiningPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                @for (role of roles; track role.value) {
                  <mat-option [value]="role.value">{{ role.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <div class="form-section">
          <h3>Personal Details</h3>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Date of Birth</mat-label>
              <input matInput [matDatepicker]="dobPicker" formControlName="dateOfBirth">
              <mat-datepicker-toggle matSuffix [for]="dobPicker"></mat-datepicker-toggle>
              <mat-datepicker #dobPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Gender</mat-label>
              <mat-select formControlName="gender">
                <mat-option value="Male">Male</mat-option>
                <mat-option value="Female">Female</mat-option>
                <mat-option value="Other">Other</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!form.valid || saving()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <mat-icon>save</mat-icon>
        }
        Save Changes
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--spacing-6);
      border-bottom: var(--border-default) solid var(--border-secondary);

      h2 {
        display: flex;
        align-items: center;
        gap: var(--spacing-4);
        margin: 0;

        .employee-avatar-large {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--action-primary);
          color: var(--text-on-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
        }

        .employee-name {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
        }

        .employee-role {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-secondary);
          text-transform: uppercase;
        }
      }
    }

    .dialog-content {
      padding: var(--spacing-6);
      max-height: 70vh;
      overflow-y: auto;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);
    }

    .form-section {
      h3 {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
        margin: 0 0 var(--spacing-4) 0;

        mat-icon {
          color: var(--action-primary);
        }
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-4);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      mat-form-field {
        width: 100%;
      }
    }

    mat-dialog-actions {
      padding: var(--spacing-4) var(--spacing-6);
      border-top: var(--border-default) solid var(--border-secondary);
    }
  `]
})
export class EmployeeEditDialogComponent {
  form: FormGroup;
  saving = signal(false);

  roles = Object.values(UserRole).map(role => ({
    value: role,
    label: ROLE_LABELS[role.toUpperCase() as keyof typeof ROLE_LABELS] || role
  }));

  employmentTypes = Object.values(EmploymentType).map(type => ({
    value: type,
    label: EMPLOYMENT_TYPE_LABELS[type.toUpperCase() as keyof typeof EMPLOYMENT_TYPE_LABELS] || type
  }));

  constructor(
    public dialogRef: MatDialogRef<EmployeeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public employee: User,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      firstName: [employee.firstName, Validators.required],
      lastName: [employee.lastName, Validators.required],
      email: [employee.email, [Validators.required, Validators.email]],
      phoneNumber: [employee.phoneNumber],
      employeeId: [employee.employeeId],
      department: [employee.department],
      designation: [employee.designation],
      employmentType: [employee.employmentType],
      dateOfJoining: [employee.dateOfJoining],
      role: [employee.role, Validators.required],
      dateOfBirth: [employee.dateOfBirth],
      gender: [employee.gender]
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close({ action: 'save', data: this.form.value });
    }
  }
}

