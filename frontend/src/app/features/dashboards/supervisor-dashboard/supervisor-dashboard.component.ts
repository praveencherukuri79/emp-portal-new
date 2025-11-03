import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './supervisor-dashboard.component.html',
  styleUrls: ['./supervisor-dashboard.component.scss']
})
export class SupervisorDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  pendingApprovals = signal<PendingApproval[]>([]);
  teamMembers = signal<TeamMember[]>([]);
  
  stats = signal({
    pendingLeaves: 0,
    pendingTimesheets: 0,
    teamSize: 0,
    activeMembers: 0
  });

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Load actual data from API
    this.stats.set({
      pendingLeaves: 3,
      pendingTimesheets: 5,
      teamSize: 12,
      activeMembers: 10
    });
  }

  approveItem(id: string): void {
    // TODO: Implement approval logic
    console.log('Approving item:', id);
  }

  rejectItem(id: string): void {
    // TODO: Implement rejection logic
    console.log('Rejecting item:', id);
  }
}
