import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

export interface QuickAction {
  label: string;
  icon: string;
  route?: string;
  color?: 'primary' | 'accent' | 'warn';
  action?: string;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <mat-card class="quick-actions-card">
      <mat-card-header>
        <mat-card-title>Quick Actions</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="actions-grid">
          @for (action of actions; track action.label) {
            <button 
              mat-raised-button 
              [color]="action.color || 'primary'"
              [routerLink]="action.route"
              (click)="action.action && onActionClick(action.action)"
              class="action-button">
              <mat-icon>{{ action.icon }}</mat-icon>
              <span>{{ action.label }}</span>
            </button>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .quick-actions-card {
      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        padding-top: 1rem;
      }

      .action-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.5rem 1rem !important;
        height: auto !important;

        mat-icon {
          font-size: 2rem;
          width: 2rem;
          height: 2rem;
        }

        span {
          font-size: 0.875rem;
          font-weight: 500;
          text-align: center;
        }
      }
    }
  `]
})
export class QuickActionsComponent {
  @Input() actions: QuickAction[] = [];
  @Output() actionClicked = new EventEmitter<string>();

  onActionClick(action: string): void {
    this.actionClicked.emit(action);
  }
}
