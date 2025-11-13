import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="notificationMenu" (menuOpened)="onMenuOpened()">
      <mat-icon [matBadge]="unreadCount()" [matBadgeHidden]="unreadCount() === 0" matBadgeColor="warn">
        notifications
      </mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header" mat-menu-item (click)="$event.stopPropagation()">
        <h3>Notifications</h3>
        @if (unreadCount() > 0) {
          <button mat-button (click)="markAllAsRead()">Mark all read</button>
        }
      </div>
      
      <mat-divider></mat-divider>

      @if (loading()) {
        <div class="notification-loading" mat-menu-item (click)="$event.stopPropagation()">
          Loading...
        </div>
      }

      @if (!loading() && notifications().length === 0) {
        <div class="notification-empty" mat-menu-item (click)="$event.stopPropagation()">
          No notifications
        </div>
      }

      @for (notification of notifications(); track notification._id) {
        <button mat-menu-item 
                class="notification-item"
                [class.unread]="!notification.isRead"
                (click)="markAsRead(notification._id)">
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ getRelativeTime(notification.createdAt) }}</div>
          </div>
          @if (!notification.isRead) {
            <mat-icon class="unread-indicator">circle</mat-icon>
          }
        </button>
      }

      <mat-divider></mat-divider>

      <button mat-menu-item routerLink="/notifications" class="view-all">
        <span>View All Notifications</span>
        <mat-icon>arrow_forward</mat-icon>
      </button>
    </mat-menu>
  `,
  styles: [`
    ::ng-deep .notification-menu {
      width: 360px;
      max-width: 90vw;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      pointer-events: auto !important;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .notification-loading,
    .notification-empty {
      text-align: center;
      padding: 24px 16px;
      color: rgba(0, 0, 0, 0.54);
      pointer-events: none !important;
    }

    .notification-item {
      padding: 12px 16px !important;
      height: auto !important;
      line-height: normal !important;
      white-space: normal !important;
      display: flex !important;
      align-items: flex-start;
      border-left: 3px solid transparent;

      &.unread {
        background-color: #f5f5f5;
        border-left-color: #1976d2;
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-title {
          font-weight: 500;
          margin-bottom: 4px;
          color: rgba(0, 0, 0, 0.87);
        }

        .notification-message {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.6);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .notification-time {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.4);
        }
      }

      .unread-indicator {
        font-size: 8px;
        width: 8px;
        height: 8px;
        color: #1976d2;
        margin-left: 8px;
        margin-top: 4px;
      }
    }

    .view-all {
      display: flex !important;
      justify-content: space-between;
      align-items: center;
      color: #1976d2;
      font-weight: 500;
    }
  `]
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  
  notifications = signal<any[]>([]);
  unreadCount = signal<number>(0);
  loading = signal<boolean>(false);
  
  private pollingSubscription?: Subscription;
  private readonly POLL_INTERVAL = 30000; // 30 seconds

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.getNotifications({ isRead: false }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const notifications = response.data.notifications || [];
          this.notifications.set(notifications.slice(0, 10)); // Show last 10
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.unreadCount.set(response.data.count || 0);
        }
      }
    });
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          // Update local state
          this.notifications.update(notifications =>
            notifications.map(n =>
              n._id === notificationId ? { ...n, isRead: true } : n
            )
          );
          this.unreadCount.update(count => Math.max(0, count - 1));
        }
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          // Update local state
          this.notifications.update(notifications =>
            notifications.map(n => ({ ...n, isRead: true }))
          );
          this.unreadCount.set(0);
        }
      }
    });
  }

  onMenuOpened(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  getRelativeTime(date: Date | string): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diff = now.getTime() - notificationDate.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return notificationDate.toLocaleDateString();
  }

  private startPolling(): void {
    this.pollingSubscription = interval(this.POLL_INTERVAL)
      .pipe(
        switchMap(() => this.notificationService.getUnreadCount())
      )
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.unreadCount.set(response.data.count || 0);
          }
        }
      });
  }

  private stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
  }
}
