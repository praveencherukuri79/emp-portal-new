import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.scss']
})
export class NotificationDropdownComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications = signal<Notification[]>([]);
  loading = signal(false);
  unreadCount = signal(0);

  constructor() {
    // Subscribe to unread count changes
    this.unreadCount = this.notificationService.unreadCount;
  }

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.getNotifications({ isRead: false }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          const notifications = Array.isArray(response.data) 
            ? response.data 
            : response.data.notifications || [];
          this.notifications.set(notifications.slice(0, 5)); // Show latest 5
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        this.loading.set(false);
      }
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.unreadCount.set(response.data.count || 0);
        }
      },
      error: (err) => {
        console.error('Failed to load unread count:', err);
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead || !notification._id) return;

    this.notificationService.markAsRead(notification._id).subscribe({
      next: () => {
        // Update local state
        this.notifications.update(notifs =>
          notifs.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
      },
      error: (err) => {
        console.error('Failed to mark notification as read:', err);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(notifs =>
          notifs.map(n => ({ ...n, isRead: true }))
        );
      },
      error: (err) => {
        console.error('Failed to mark all as read:', err);
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'timesheet_approved':
      case 'timesheet_rejected':
        return 'schedule';
      case 'leave_approved':
      case 'leave_rejected':
        return 'event_available';
      case 'document_expiring':
        return 'folder';
      case 'password_reset':
        return 'lock';
      default:
        return 'notifications';
    }
  }

  getNotificationColor(type: string): string {
    if (type.includes('approved')) return 'success';
    if (type.includes('rejected') || type.includes('expiring')) return 'warn';
    return 'primary';
  }

  formatTime(date: Date | string): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString();
  }
}

