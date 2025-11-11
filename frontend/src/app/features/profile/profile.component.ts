import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../core/models/user.model';
import { UINotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser = signal<User | null>(null);
  profileForm!: FormGroup;
  loading = signal(false);
  saving = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private notification: UINotificationService
  ) {
    this.currentUser.set(this.authService.currentUser());
  }

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  initForm(): void {
    const user = this.currentUser();
    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [user?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [{ value: user?.email || '', disabled: true }],
      phone: [user?.phoneNumber || ''],
      employeeId: [{ value: user?.employeeId || '', disabled: true }],
      department: [{ value: user?.department || '', disabled: true }],
      designation: [{ value: user?.designation || '', disabled: true }]
    });
  }

  loadProfile(): void {
    this.loading.set(true);
    this.userService.getProfile().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          const user = response.data;
          this.currentUser.set(user);
          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phoneNumber || '',
            employeeId: user.employeeId,
            department: user.department,
            designation: user.designation
          });
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        this.notification.showError('Failed to load profile data.');
        this.loading.set(false);
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.saving.set(true);
    const formValue = this.profileForm.getRawValue();
    
    this.userService.updateProfile(formValue).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.notification.showSuccess('Profile updated successfully!');
          // Reload current user from auth service
          this.currentUser.set(this.authService.currentUser());
        }
        this.saving.set(false);
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        this.notification.showError('Failed to update profile. Please try again.');
        this.saving.set(false);
      }
    });
  }

  get firstName() {
    return this.profileForm.get('firstName');
  }

  get lastName() {
    return this.profileForm.get('lastName');
  }

  get phone() {
    return this.profileForm.get('phone');
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }

  getRoleName(): string {
    const user = this.currentUser();
    return user?.role?.toLowerCase().replace('_', ' ') || 'User';
  }
}

