import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  systemHealth = signal<SystemHealth>({
    cpu: 0,
    memory: 0,
    storage: 0,
    status: 'healthy'
  });
  activityLogs = signal<ActivityLog[]>([]);
  
  stats = signal({
    totalUsers: 0,
    activeUsers: 0,
    departments: 0,
    systemUptime: ''
  });

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Load actual data from API
    this.stats.set({
      totalUsers: 178,
      activeUsers: 156,
      departments: 8,
      systemUptime: '99.9%'
    });

    this.systemHealth.set({
      cpu: 45,
      memory: 62,
      storage: 73,
      status: 'healthy'
    });
  }

  getHealthStatus(): string {
    const health = this.systemHealth();
    const maxUsage = Math.max(health.cpu, health.memory, health.storage);
    
    if (maxUsage >= 90) return 'critical';
    if (maxUsage >= 75) return 'warning';
    return 'healthy';
  }
}
