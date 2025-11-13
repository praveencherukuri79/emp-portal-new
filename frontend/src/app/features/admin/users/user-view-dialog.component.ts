import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { User } from '../../../core/models/user.model';
import { ROLE_LABELS } from '@shared/types/constants';

@Component({
  selector: 'app-user-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="dialog-header">
      <div class="header-content">
        <div class="user-avatar-large">{{ getInitials() }}</div>
        <div>
          <h2 mat-dialog-title>{{ user.firstName }} {{ user.lastName }}</h2>
          <p class="user-email">{{ user.email }}</p>
        </div>
      </div>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <div class="info-section">
        <h3>Basic Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">First Name:</span>
            <span class="value">{{ user.firstName || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Last Name:</span>
            <span class="value">{{ user.lastName || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{{ user.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">Phone:</span>
            <span class="value">{{ user.phoneNumber || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Gender:</span>
            <span class="value">{{ user.gender || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Date of Birth:</span>
            <span class="value">{{ user.dateOfBirth ? (user.dateOfBirth | date:'mediumDate') : 'N/A' }}</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3>Employment Details</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Employee ID:</span>
            <span class="value">{{ user.employeeId || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Role:</span>
            <span class="value"><mat-chip>{{ getRoleLabel() }}</mat-chip></span>
          </div>
          <div class="info-item">
            <span class="label">Department:</span>
            <span class="value">{{ user.department || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Designation:</span>
            <span class="value">{{ user.designation || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Employment Type:</span>
            <span class="value">{{ user.employmentType || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Date of Joining:</span>
            <span class="value">{{ user.dateOfJoining ? (user.dateOfJoining | date:'mediumDate') : 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Status:</span>
            <span class="value">
              <mat-chip [color]="user.isActive ? 'primary' : 'warn'">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </mat-chip>
            </span>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-raised-button color="primary" (click)="onEdit()">
        <mat-icon>edit</mat-icon>
        Edit User
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;

      .header-content {
        display: flex;
        gap: 1rem;
        align-items: center;

        .user-avatar-large {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.5rem;
        }

        h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .user-email {
          margin: 0.25rem 0 0 0;
          color: #666;
        }
      }
    }

    .dialog-content {
      padding: 1.5rem;
      max-height: 60vh;
      overflow-y: auto;
    }

    .info-section {
      margin-bottom: 2rem;

      h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .label {
            font-size: 0.875rem;
            color: #666;
            font-weight: 500;
          }

          .value {
            font-size: 1rem;
            color: #333;
          }
        }
      }
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class UserViewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UserViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public user: User
  ) {}

  getInitials(): string {
    const first = this.user.firstName?.charAt(0) || '';
    const last = this.user.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  }

  getRoleLabel(): string {
    const role = this.user.role?.toUpperCase();
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || this.user.role || 'N/A';
  }

  onEdit(): void {
    this.dialogRef.close({ action: 'edit', user: this.user });
  }
}

