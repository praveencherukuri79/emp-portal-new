import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export interface RecentActivity {
  icon: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  route?: string;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <mat-card class="recent-activity-card">
      <mat-card-header>
        <mat-card-title>Recent Activity</mat-card-title>
        @if (viewAllRoute) {
          <button mat-button [routerLink]="viewAllRoute">
            View All
            <mat-icon>arrow_forward</mat-icon>
          </button>
        }
      </mat-card-header>
      <mat-card-content>
        @if (activities.length === 0) {
          <div class="empty-state">
            <mat-icon>history</mat-icon>
            <p>No recent activity</p>
          </div>
        } @else {
          <div class="activity-timeline">
            @for (activity of activities; track activity.timestamp) {
              <div class="activity-item" [class]="'activity-' + activity.type">
                <div class="activity-icon">
                  <mat-icon>{{ activity.icon }}</mat-icon>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-timestamp">{{ formatTimestamp(activity.timestamp) }}</div>
                </div>
                @if (activity.route) {
                  <button mat-icon-button [routerLink]="activity.route">
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                }
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .recent-activity-card {
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        button {
          mat-icon {
            margin-left: 0.25rem;
            font-size: 1.125rem;
            width: 1.125rem;
            height: 1.125rem;
          }
        }
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-secondary);

        mat-icon {
          font-size: 3rem;
          width: 3rem;
          height: 3rem;
          opacity: 0.5;
          margin-bottom: 1rem;
        }

        p {
          margin: 0;
        }
      }

      .activity-timeline {
        padding-top: 1rem;

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-left: 3px solid;
          border-radius: var(--border-radius);
          margin-bottom: 0.75rem;
          transition: all 0.2s ease;

          &:hover {
            background: var(--hover-background);
          }

          &.activity-info {
            border-color: var(--info-color);
            background: var(--info-background);

            .activity-icon {
              color: var(--info-color);
            }
          }

          &.activity-success {
            border-color: var(--success-color);
            background: var(--success-background);

            .activity-icon {
              color: var(--success-color);
            }
          }

          &.activity-warning {
            border-color: var(--warning-color);
            background: var(--warning-background);

            .activity-icon {
              color: var(--warning-color);
            }
          }

          &.activity-error {
            border-color: var(--danger-color);
            background: var(--danger-background);

            .activity-icon {
              color: var(--danger-color);
            }
          }

          .activity-icon {
            mat-icon {
              font-size: 1.5rem;
              width: 1.5rem;
              height: 1.5rem;
            }
          }

          .activity-content {
            flex: 1;

            .activity-title {
              font-weight: 600;
              font-size: 0.9375rem;
              margin-bottom: 0.25rem;
            }

            .activity-description {
              font-size: 0.8125rem;
              color: var(--text-secondary);
              margin-bottom: 0.5rem;
            }

            .activity-timestamp {
              font-size: 0.75rem;
              color: var(--text-tertiary);
            }
          }
        }
      }
    }
  `]
})
export class RecentActivityComponent {
  @Input() activities: RecentActivity[] = [];
  @Input() viewAllRoute?: string;

  formatTimestamp(timestamp: Date): string {
    const now = dayjs();
    const then = dayjs(timestamp);
    const diff = now.diff(then, 'minutes');

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
    return then.format('MMM D, YYYY');
  }
}
