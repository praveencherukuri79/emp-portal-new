import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UINotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';
import { EmployeeViewDialogComponent } from './employee-view-dialog.component';
import { EmployeeEditDialogComponent } from './employee-edit-dialog.component';
import { UserTableComponent } from '../../../shared/components/user-table/user-table.component';
import { UserTableAction, DEFAULT_COLUMNS } from '../../../shared/components/user-table/user-table.types';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    FormsModule,
    UserTableComponent
  ],
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.scss']
})
export class EmployeeManagementComponent implements OnInit {
  private userService = inject(UserService);
  private notification = inject(UINotificationService);
  private dialog = inject(MatDialog);

  loading = signal(false);
  employees = signal<User[]>([]);
  searchQuery = signal('');
  selectedRole = signal<string>('all');
  selectedStatus = signal<string>('all');

  // Table configuration
  tableColumns = DEFAULT_COLUMNS.HR;

  // Filtered employees for the table
  filteredEmployeesData = computed(() => {
    const allEmployees = this.employees();
    if (!Array.isArray(allEmployees)) return [];
    
    let employees = [...allEmployees];
    
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      employees = employees.filter(e => 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(query) ||
        e.email?.toLowerCase().includes(query) ||
        e.employeeId?.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatus() !== 'all') {
      employees = employees.filter(e => 
        this.selectedStatus() === 'active' ? e.isActive : !e.isActive
      );
    }

    return employees;
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading.set(true);
    this.userService.getAllUsers({ role: 'employee' }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          // Backend returns { users: User[], pagination: {...} }
          const data = response.data as { users: User[]; pagination: any };
          const usersArray = (data.users && Array.isArray(data.users)) ? data.users : [];
          this.employees.set(usersArray);
        } else {
          this.employees.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.notification.showError('Failed to load employees');
        this.loading.set(false);
      }
    });
  }

  // Event handlers for UserTableComponent
  onViewEmployee(event: UserTableAction): void {
    this.viewEmployee(event.user as User);
  }

  onEditEmployee(event: UserTableAction): void {
    this.editEmployee(event.user as User);
  }

  viewEmployee(employee: User): void {
    const dialogRef = this.dialog.open(EmployeeViewDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: employee
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'edit') {
        this.editEmployee(result.employee);
      }
    });
  }

  editEmployee(employee: User): void {
    const dialogRef = this.dialog.open(EmployeeEditDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: employee
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'save') {
        this.updateEmployee(employee._id!, result.data);
      }
    });
  }

  updateEmployee(userId: string, data: Partial<User>): void {
    // ✅ FIX: Use updateUserById instead of updateProfile
    // updateProfile updates the CURRENT user (HR), updateUserById updates the target employee
    this.userService.updateUserById(userId, data as any).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.notification.showSuccess('Employee updated successfully');
          this.loadEmployees();
        } else {
          this.notification.showError(response.message || 'Failed to update employee');
        }
      },
      error: (error) => {
        console.error('Error updating employee:', error);
        this.notification.showError(error.error?.message || 'Failed to update employee');
      }
    });
  }
}


