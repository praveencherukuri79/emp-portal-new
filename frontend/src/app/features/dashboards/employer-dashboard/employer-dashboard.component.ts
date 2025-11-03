import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

interface FinancialMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employer-dashboard.component.html',
  styleUrls: ['./employer-dashboard.component.scss']
})
export class EmployerDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  
  stats = signal({
    totalRevenue: 0,
    billableHours: 0,
    activeProjects: 0,
    employeeCount: 0
  });

  financialMetrics = signal<FinancialMetric[]>([]);

  recentProjects = signal<any[]>([]);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Load actual data from API
    this.stats.set({
      totalRevenue: 2450000,
      billableHours: 8750,
      activeProjects: 24,
      employeeCount: 156
    });

    this.financialMetrics.set([
      { label: 'Monthly Revenue', value: '$245,000', change: 12.5, trend: 'up' },
      { label: 'Operating Costs', value: '$125,000', change: -3.2, trend: 'down' },
      { label: 'Net Profit', value: '$120,000', change: 18.7, trend: 'up' },
      { label: 'Utilization Rate', value: '87%', change: 5.3, trend: 'up' }
    ]);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  }
}
