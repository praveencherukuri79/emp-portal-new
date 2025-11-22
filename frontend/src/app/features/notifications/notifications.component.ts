import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { NotificationService, Notification } from '../../services/notification.service';
import { UINotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private uiNotification = inject(UINotificationService);

  allNotifications = signal<Notification[]>([]);
  unreadNotifications = signal<Notification[]>([]);
  readNotifications = signal<Notification[]>([]);
  loading = signal(false);
  selectedTab = signal(0);
  selectedTabIndex = 0; // For two-way binding

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.getNotifications().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          const notifications = Array.isArray(response.data) 
            ? response.data 
            : response.data.notifications || [];
          
          this.allNotifications.set(notifications);
          this.unreadNotifications.set(notifications.filter((n: Notification) => !n.isRead));
          this.readNotifications.set(notifications.filter((n: Notification) => n.isRead));
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        this.loading.set(false);
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead || !notification._id) return;

    this.notificationService.markAsRead(notification._id).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (err) => {
        console.error('Failed to mark notification as read:', err);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (err) => {
        console.error('Failed to mark all as read:', err);
      }
    });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const confirmed = await this.uiNotification.confirm({
      title: 'Delete Notification',
      message: 'Delete this notification?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'warn'
    });

    if (!confirmed) return;

    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.loadNotifications();
        this.uiNotification.showSuccess('Notification deleted');
      },
      error: (err) => {
        console.error('Failed to delete notification:', err);
        this.uiNotification.showError('Failed to delete notification');
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


