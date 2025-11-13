import { Component, Injectable, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  action?: string;
}

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, MatIconModule, MatButtonModule],
  template: `
    <div class="toast-container" [ngClass]="'toast-' + data.type">
      <mat-icon class="toast-icon">{{ getIcon() }}</mat-icon>
      <span class="toast-message">{{ data.message }}</span>
      @if (data.action) {
        <button mat-button (click)="dismiss()">{{ data.action }}</button>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 8px;
      min-width: 300px;
    }

    .toast-icon {
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
    }

    .toast-success {
      background-color: #4caf50;
      color: white;
    }

    .toast-error {
      background-color: #f44336;
      color: white;
    }

    .toast-warning {
      background-color: #ff9800;
      color: white;
    }

    .toast-info {
      background-color: #2196f3;
      color: white;
    }
  `]
})
export class ToastNotificationComponent {
  data: ToastConfig = {
    message: '',
    type: 'info',
    action: 'Close'
  };

  private snackBarRef = inject(MatSnackBar);

  getIcon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}

/**
 * Toast Notification Service
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private snackBar = inject(MatSnackBar);

  private show(config: ToastConfig): void {
    const snackBarConfig: MatSnackBarConfig = {
      duration: config.duration || this.getDefaultDuration(config.type || 'info'),
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`toast-${config.type || 'info'}`]
    };

    this.snackBar.open(
      config.message,
      config.action || 'Close',
      snackBarConfig
    );
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  private getDefaultDuration(type: ToastType): number {
    switch (type) {
      case 'success':
        return 3000;
      case 'error':
        return 5000;
      case 'warning':
        return 4000;
      case 'info':
      default:
        return 3000;
    }
  }
}

