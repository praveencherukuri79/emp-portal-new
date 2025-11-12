import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UINotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';
import { EmployeeViewDialogComponent } from './employee-view-dialog.component';
import { EmployeeEditDialogComponent } from './employee-edit-dialog.component';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    MatTooltipModule,
    FormsModule
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

  displayedColumns = ['name', 'employeeId', 'department', 'role', 'status', 'actions'];

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

  get filteredEmployees(): User[] {
    const allEmployees = this.employees();
    if (!Array.isArray(allEmployees)) {
      return [];
    }
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
    this.userService.updateProfile(data as any).subscribe({
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

