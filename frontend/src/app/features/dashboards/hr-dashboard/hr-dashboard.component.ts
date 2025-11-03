import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

interface DocumentAlert {
  id: string;
  employeeName: string;
  documentType: string;
  expiryDate: Date;
  status: 'expired' | 'expiring-soon' | 'missing';
}

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hr-dashboard.component.html',
  styleUrls: ['./hr-dashboard.component.scss']
})
export class HrDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  documentAlerts = signal<DocumentAlert[]>([]);
  
  stats = signal({
    totalEmployees: 0,
    pendingLeaves: 0,
    documentAlerts: 0,
    complianceRate: 0
  });

  leaveStats = signal({
    approvedThisMonth: 0,
    pendingApproval: 0,
    rejectedThisMonth: 0
  });

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Load actual data from API
    this.stats.set({
      totalEmployees: 156,
      pendingLeaves: 8,
      documentAlerts: 12,
      complianceRate: 94
    });

    this.leaveStats.set({
      approvedThisMonth: 24,
      pendingApproval: 8,
      rejectedThisMonth: 3
    });
  }

  handleAlert(id: string): void {
    console.log('Handling alert:', id);
  }
}
