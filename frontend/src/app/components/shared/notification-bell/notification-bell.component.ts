import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatListModule
  ],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  unreadCount = this.notificationService.unreadCount;
  notifications: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadNotifications();
    this.notificationService.initializeUnreadCount();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications({ isRead: false }).subscribe({
      next: (response) => {
        this.notifications = response.data?.notifications?.slice(0, 5) || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  markAsRead(notificationId: string, actionUrl?: string): void {
    this.notificationService.markAsRead(notificationId).subscribe(() => {
      this.loadNotifications();
      if (actionUrl) {
        this.router.navigate([actionUrl]);
      }
    });
  }

  viewAll(): void {
    this.router.navigate(['/notifications']);
  }
}

