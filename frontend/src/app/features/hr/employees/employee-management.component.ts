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
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UINotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';

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
    FormsModule
  ],
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.scss']
})
export class EmployeeManagementComponent implements OnInit {
  private userService = inject(UserService);
  private notification = inject(UINotificationService);

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
          this.employees.set(response.data);
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
    let employees = this.employees();
    
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
}

