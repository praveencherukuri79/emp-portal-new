import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  status?: string;
}

interface TeamMember {
  id: string;
  name: string;
  hoursThisWeek: number;
  leaveDays: number;
  status: 'active' | 'on-leave' | 'inactive';
  department?: string;
}

interface TeamActivity {
  id: string;
  type: 'timesheet' | 'leave' | 'document';
  employeeName: string;
  action: string;
  timestamp: Date;
}

interface CalendarEvent {
  date: Date;
  employeeName: string;
  type: 'leave' | 'holiday' | 'event';
  status?: string;
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
    MatTableModule,
    MatTooltipModule,
    StatsCardComponent
  ],
  templateUrl: './supervisor-dashboard.component.html',
  styleUrls: ['./supervisor-dashboard.component.scss']
})
export class SupervisorDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  pendingApprovals = signal<PendingApproval[]>([]);
  teamMembers = signal<TeamMember[]>([]);
  teamActivity = signal<TeamActivity[]>([]);
  calendarEvents = signal<CalendarEvent[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  stats = signal({
    pendingLeaves: 0,
    pendingTimesheets: 0,
    teamSize: 0,
    activeMembers: 0,
    teamHoursThisWeek: 0,
    teamOnLeaveToday: 0
  });

  statsCards = signal<StatsCardData[]>([]);
  approvalColumns = ['employee', 'type', 'details', 'submitted', 'actions'];
  activityColumns = ['employee', 'action', 'time'];

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
            activeMembers: data.activeMembers || 0,
            teamHoursThisWeek: data.teamHoursThisWeek || 0,
            teamOnLeaveToday: data.teamOnLeaveToday || 0
          });

          // Create interactive stats cards
          this.statsCards.set([
            {
              title: 'Pending Approvals',
              value: ((data.pendingLeaves || 0) + (data.pendingTimesheets || 0)).toString(),
              icon: 'pending_actions',
              color: 'warning',
              route: '/supervisor/approvals',
              clickable: true,
              subtitle: 'require attention'
            },
            {
              title: 'Team Hours',
              value: (data.teamHoursThisWeek || 0).toString(),
              icon: 'schedule',
              color: 'primary',
              route: '/supervisor/reports',
              clickable: true,
              subtitle: 'this week'
            },
            {
              title: 'Team Members',
              value: (data.teamSize || 0).toString(),
              icon: 'groups',
              color: 'info',
              route: '/supervisor/team',
              clickable: true,
              subtitle: 'total team size'
            },
            {
              title: 'On Leave Today',
              value: (data.teamOnLeaveToday || 0).toString(),
              icon: 'event_busy',
              color: 'warning',
              route: '/supervisor/team',
              clickable: true,
              subtitle: 'currently on leave'
            }
          ]);

          if (data.pendingApprovals) {
            this.pendingApprovals.set(data.pendingApprovals);
          }

          if (data.teamMembers) {
            this.teamMembers.set(data.teamMembers);
          }

          if (data.teamActivity) {
            this.teamActivity.set(data.teamActivity);
          }

          if (data.calendarEvents) {
            this.calendarEvents.set(data.calendarEvents);
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
    this.router.navigate(['/supervisor/approvals'], { queryParams: { id } });
  }

  rejectItem(id: string): void {
    this.router.navigate(['/supervisor/approvals'], { queryParams: { id } });
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'active': 'success',
      'on-leave': 'warning',
      'inactive': 'default',
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'warn'
    };
    return colorMap[status] || 'default';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
