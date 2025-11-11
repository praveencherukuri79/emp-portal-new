import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { User } from '../../../core/models/user.model';
import { StatsCardComponent, StatsCardData } from '../../../shared/components/stats-card/stats-card.component';

interface PendingApproval {
  id: string;
  type: 'leave' | 'timesheet';
  employeeName: string;
  employeeId: string;
  details: string;
  submittedDate: Date;
}

interface TeamMember {
  id: string;
  name: string;
  hoursThisWeek: number;
  leaveDays: number;
  status: 'active' | 'on-leave' | 'inactive';
}

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatProgressSpinnerModule, 
    MatButtonModule, 
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    StatsCardComponent
  ],
  templateUrl: './supervisor-dashboard.component.html',
  styleUrls: ['./supervisor-dashboard.component.scss']
})
export class SupervisorDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  pendingApprovals = signal<PendingApproval[]>([]);
  teamMembers = signal<TeamMember[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  stats = signal({
    pendingLeaves: 0,
    pendingTimesheets: 0,
    teamSize: 0,
    activeMembers: 0
  });

  statsCards = signal<StatsCardData[]>([]);

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboard().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          const data = response.data;
          
          this.stats.set({
            pendingLeaves: data.pendingLeaves || 0,
            pendingTimesheets: data.pendingTimesheets || 0,
            teamSize: data.teamSize || 0,
            activeMembers: data.activeMembers || 0
          });

          // Create interactive stats cards
          this.statsCards.set([
            {
              title: 'Pending Leaves',
              value: (data.pendingLeaves || 0).toString(),
              icon: 'event_busy',
              color: 'warning',
              route: '/supervisor/approvals?type=leave',
              clickable: true,
              subtitle: 'awaiting approval'
            },
            {
              title: 'Pending Timesheets',
              value: (data.pendingTimesheets || 0).toString(),
              icon: 'pending_actions',
              color: 'warning',
              route: '/supervisor/approvals?type=timesheet',
              clickable: true,
              subtitle: 'awaiting review'
            },
            {
              title: 'Team Members',
              value: (data.teamSize || 0).toString(),
              icon: 'groups',
              color: 'primary',
              route: '/supervisor/team',
              clickable: true,
              subtitle: 'total team size'
            },
            {
              title: 'Active Today',
              value: (data.activeMembers || 0).toString(),
              icon: 'person',
              color: 'success',
              route: '/supervisor/team',
              clickable: true,
              subtitle: 'currently active'
            }
          ]);

          if (data.pendingApprovals) {
            this.pendingApprovals.set(data.pendingApprovals);
          }

          if (data.teamMembers) {
            this.teamMembers.set(data.teamMembers);
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.error.set('Failed to load dashboard data. Please try again.');
        this.loading.set(false);
      }
    });
  }

  approveItem(id: string): void {
    // Navigate to approvals page with filter
    this.router.navigate(['/supervisor/approvals'], { queryParams: { id } });
  }

  rejectItem(id: string): void {
    // Navigate to approvals page with filter
    this.router.navigate(['/supervisor/approvals'], { queryParams: { id } });
  }
}
