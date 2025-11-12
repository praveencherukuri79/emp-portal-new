import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UINotificationService } from '../../../core/services/notification.service';
import { User, UserRole } from '../../../core/models/user.model';
import { ROLE_LABELS } from '@shared/types/constants';
import { ICreateUserRequest } from '@shared/types/requests';
import { CreateUserDialogComponent } from './create-user-dialog.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
  private notification = inject(UINotificationService);
  private dialog = inject(MatDialog);

  loading = signal(false);
  users = signal<User[]>([]);
  searchQuery = signal('');
  roleFilter = signal<string>('');

  displayedColumns = ['name', 'email', 'role', 'department', 'status', 'actions'];
  roles = Object.values(UserRole);
  roleLabels = ROLE_LABELS;
  UserRole = UserRole; // Expose to template

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    const params: any = {};
    if (this.roleFilter()) {
      params.role = this.roleFilter();
    }
    this.userService.getAllUsers(params).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          // Backend returns { users: User[], pagination: {...} }
          const data = response.data as { users: User[]; pagination: any };
          const usersArray = (data.users && Array.isArray(data.users)) ? data.users : [];
          this.users.set(usersArray);
        } else {
          this.users.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.notification.showError('Failed to load users');
        this.loading.set(false);
      }
    });
  }

  get filteredUsers(): User[] {
    const allUsers = this.users();
    if (!Array.isArray(allUsers)) {
      return [];
    }
    let filtered = [...allUsers];
    
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(u => 
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.employeeId?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }

  getRoleLabel(role: UserRole): string {
    return this.roleLabels[role.toUpperCase() as keyof typeof ROLE_LABELS] || role;
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe((userData: ICreateUserRequest | null) => {
      if (userData) {
        this.loading.set(true);
        this.userService.createUser(userData).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.notification.showSuccess('User created successfully');
              this.loadUsers();
            } else {
              this.notification.showError(response.message || 'Failed to create user');
              this.loading.set(false);
            }
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.notification.showError(error.error?.message || 'Failed to create user');
            this.loading.set(false);
          }
        });
      }
    });
  }

  updateUserRole(user: User, newRole: UserRole): void {
    this.loading.set(true);
    this.userService.updateUserRole(user._id, newRole).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.notification.showSuccess('User role updated successfully');
          this.loadUsers();
        } else {
          this.notification.showError(response.message || 'Failed to update user role');
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        this.notification.showError('Failed to update user role');
        this.loading.set(false);
      }
    });
  }

  toggleUserStatus(user: User): void {
    this.loading.set(true);
    const action = user.isActive 
      ? this.userService.deactivateUser(user._id)
      : this.userService.activateUser(user._id);

    action.subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.notification.showSuccess(
            user.isActive ? 'User deactivated successfully' : 'User activated successfully'
          );
          this.loadUsers();
        } else {
          this.notification.showError(response.message || 'Failed to update user status');
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        this.notification.showError('Failed to update user status');
        this.loading.set(false);
      }
    });
  }

  onRoleFilterChange(role: string): void {
    this.roleFilter.set(role);
    this.loadUsers();
  }
}
