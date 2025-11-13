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
import { ValidatorsUtil } from '../../../shared/utils/validators.util';

export interface CreateUserDialogData {
  user?: any;
  mode?: 'create' | 'edit';
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
      email: ['', [Validators.required, Validators.email, ValidatorsUtil.emailField()]],
      password: ['', [Validators.required, ValidatorsUtil.strongPassword()]],
      firstName: ['', [Validators.required, ValidatorsUtil.nameField()]],
      lastName: ['', [Validators.required, ValidatorsUtil.nameField()]],
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

    // Patch form if editing existing user
    if (this.isEditMode && this.data.user) {
      this.patchFormValues();
    }
  }

  get isEditMode(): boolean {
    return this.data?.mode === 'edit' && !!this.data.user;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Edit User' : 'Create New User';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update User' : 'Create User';
  }

  patchFormValues(): void {
    const user = this.data.user;
    
    // Make password optional for edit mode
    if (this.isEditMode) {
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    }

    this.form.patchValue({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || '',
      phoneNumber: user.phoneNumber || '',
      department: user.department || '',
      designation: user.designation || '',
      employeeId: user.employeeId || '',
      joiningDate: user.dateOfJoining || user.joiningDate || '',
      employmentType: user.employmentType || '',
      reportingTo: user.reportingManagerId || user.reportingTo || ''
    });

    // Trigger role change to show appropriate fields
    if (user.role) {
      this.updateFormFields(user.role);
    }
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
    
    const userData: any = {
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      role: formValue.role,
      phoneNumber: formValue.phoneNumber || undefined,
      department: formValue.department || undefined,
      designation: formValue.designation || undefined,
      employeeId: formValue.employeeId || undefined,
      dateOfJoining: formValue.joiningDate ? new Date(formValue.joiningDate).toISOString() : undefined,
      employmentType: formValue.employmentType || undefined,
      reportingTo: formValue.reportingTo || undefined
    };

    // Only include password if provided (for edit mode, password is optional)
    if (formValue.password) {
      userData.password = formValue.password;
    }

    this.dialogRef.close(userData);
  }
}

