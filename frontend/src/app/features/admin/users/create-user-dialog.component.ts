import { Component, Inject, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserRole, EmploymentType } from '@shared/types';
import { ROLE_LABELS, EMPLOYMENT_TYPE_LABELS } from '@shared/types/constants';
import { requiresEmployeeDetails } from '@shared/types/role-config';
import { ICreateUserRequest } from '@shared/types/requests';
import { UserService } from '../../../services/user.service';
import { IUserResponse } from '@shared/types/responses';

export interface CreateUserDialogData {
  // No data needed for create, but keeping interface for consistency
}

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.scss']
})
export class CreateUserDialogComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  form: FormGroup;
  loading = signal(false);
  roles = Object.values(UserRole);
  roleLabels = ROLE_LABELS;
  employmentTypes = Object.values(EmploymentType);
  employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;
  supervisors = signal<IUserResponse[]>([]);
  employees = signal<IUserResponse[]>([]);

  constructor(
    public dialogRef: MatDialogRef<CreateUserDialogComponent, ICreateUserRequest | null>,
    @Inject(MAT_DIALOG_DATA) public data: CreateUserDialogData
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      role: ['', [Validators.required]],
      phoneNumber: [''],
      department: [''],
      designation: [''],
      employeeId: [''],
      joiningDate: [''],
      employmentType: [''],
      reportingTo: ['']
    });
  }

  ngOnInit(): void {
    // Load supervisors for reportingTo dropdown
    this.loadSupervisors();
    
    // Watch role changes to show/hide fields
    this.form.get('role')?.valueChanges.subscribe(role => {
      this.updateFormFields(role);
    });
  }

  loadSupervisors(): void {
    this.userService.getAllUsers({ role: UserRole.SUPERVISOR }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const data = response.data as { users: IUserResponse[]; pagination: any };
          this.supervisors.set(data.users || []);
        }
      },
      error: (error) => {
        console.error('Error loading supervisors:', error);
      }
    });
  }

  updateFormFields(role: UserRole): void {
    // Show/hide fields based on configuration
    const employeeFields = ['department', 'designation', 'employeeId', 'joiningDate', 'employmentType', 'reportingTo'];
    const shouldShowFields = requiresEmployeeDetails(role);
    
    employeeFields.forEach(field => {
      const control = this.form.get(field);
      if (control) {
        if (shouldShowFields) {
          control.setValidators([]);
        } else {
          control.clearValidators();
          control.setValue('');
        }
        control.updateValueAndValidity();
      }
    });
  }

  get showEmployeeFields(): boolean {
    const role = this.form.get('role')?.value;
    // Use configuration to determine if employee fields should be shown
    return role ? requiresEmployeeDetails(role) : false;
  }

  getRoleLabel(role: UserRole): string {
    return this.roleLabels[role.toUpperCase() as keyof typeof ROLE_LABELS] || role;
  }

  getEmploymentTypeLabel(type: EmploymentType): string {
    return this.employmentTypeLabels[type.toUpperCase() as keyof typeof EMPLOYMENT_TYPE_LABELS] || type;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.form.value;
    
    const userData: ICreateUserRequest = {
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      role: formValue.role,
      phoneNumber: formValue.phoneNumber || undefined,
      department: formValue.department || undefined,
      designation: formValue.designation || undefined,
      employeeId: formValue.employeeId || undefined,
      joiningDate: formValue.joiningDate ? new Date(formValue.joiningDate).toISOString() : undefined,
      employmentType: formValue.employmentType || undefined,
      reportingTo: formValue.reportingTo || undefined
    };

    this.dialogRef.close(userData);
  }
}

