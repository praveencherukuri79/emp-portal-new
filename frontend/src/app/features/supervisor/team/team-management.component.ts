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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UINotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';

interface TeamMemberData extends User {
  hoursThisWeek?: number;
  hoursThisMonth?: number;
  pendingLeaves?: number;
  lastActive?: Date;
}


@Component({
  selector: 'app-team-management',
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
    MatTabsModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.scss']
})
export class TeamManagementComponent implements OnInit {
  private userService = inject(UserService);
  private notification = inject(UINotificationService);

  loading = signal(false);
  teamMembers = signal<TeamMemberData[]>([]);
  searchQuery = signal('');
  selectedDepartment = signal<string>('all');
  departments = signal<string[]>([]);

  displayedColumns = ['name', 'department', 'designation', 'hours', 'leaves', 'status', 'actions'];

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  loadTeamMembers(): void {
    this.loading.set(true);
    this.userService.getTeamMembers().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.teamMembers.set(response.data);
          // Extract unique departments
          const depts = [...new Set(response.data.map((m: TeamMemberData) => m.department).filter((d: string | undefined): d is string => Boolean(d)))];
          this.departments.set(['all', ...depts]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        this.notification.showError('Failed to load team members');
        this.loading.set(false);
      }
    });
  }

  get filteredMembers(): TeamMemberData[] {
    let members = this.teamMembers();
    
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      members = members.filter(m => 
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.employeeId?.toLowerCase().includes(query) ||
        m.department?.toLowerCase().includes(query)
      );
    }

    if (this.selectedDepartment() !== 'all') {
      members = members.filter((m: TeamMemberData) => m.department === this.selectedDepartment());
    }

    return members;
  }

  getStatusColor(status: string): string {
    const statusMap: Record<string, string> = {
      'active': 'success',
      'on-leave': 'warning',
      'inactive': 'default'
    };
    return statusMap[status] || 'default';
  }

  viewMemberDetails(member: TeamMemberData): void {
    // Navigate to member details or open dialog
    this.notification.showInfo(`Viewing details for ${member.firstName} ${member.lastName}`);
  }
}

