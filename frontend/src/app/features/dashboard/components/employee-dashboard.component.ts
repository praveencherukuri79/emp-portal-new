import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { StatsCardData } from '../../../shared/components/stats-card/stats-card.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    StatsCardComponent
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss'
})
export class EmployeeDashboardComponent implements OnInit {
  stats = signal<StatsCardData[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    // Mock data - will be replaced with API calls
    this.stats.set([
      {
        title: 'Hours This Week',
        value: '38.5',
        icon: 'schedule',
        color: 'primary',
        trend: { value: 5.2, isPositive: true }
      },
      {
        title: 'Leave Balance',
        value: '12',
        icon: 'event_available',
        color: 'success',
        subtitle: 'days remaining'
      },
      {
        title: 'Pending Approvals',
        value: '2',
        icon: 'pending_actions',
        color: 'warning',
        subtitle: 'awaiting review'
      },
      {
        title: 'Documents',
        value: '8',
        icon: 'folder',
        color: 'info',
        subtitle: 'uploaded'
      }
    ]);
  }
}
