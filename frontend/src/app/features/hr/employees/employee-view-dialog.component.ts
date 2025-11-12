import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-employee-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <div class="employee-avatar-large">
          {{ employee.firstName[0] }}{{ employee.lastName[0] }}
        </div>
        <div>
          <div class="employee-name">{{ employee.firstName }} {{ employee.lastName }}</div>
          <div class="employee-role">{{ employee.role }}</div>
        </div>
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <div class="info-section">
        <h3><mat-icon>badge</mat-icon> Basic Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Employee ID</label>
            <span>{{ employee.employeeId || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Email</label>
            <span>{{ employee.email }}</span>
          </div>
          <div class="info-item">
            <label>Phone</label>
            <span>{{ employee.phoneNumber || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Status</label>
            <mat-chip [color]="employee.isActive ? 'primary' : 'default'">
              {{ employee.isActive ? 'Active' : 'Inactive' }}
            </mat-chip>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="info-section">
        <h3><mat-icon>work</mat-icon> Employment Details</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Department</label>
            <span>{{ employee.department || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Designation</label>
            <span>{{ employee.designation || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Employment Type</label>
            <span>{{ employee.employmentType || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Date of Joining</label>
            <span>{{ formatDate(employee.dateOfJoining) }}</span>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="info-section">
        <h3><mat-icon>info</mat-icon> Additional Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Gender</label>
            <span>{{ employee.gender || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Date of Birth</label>
            <span>{{ formatDate(employee.dateOfBirth) }}</span>
          </div>
          <div class="info-item">
            <label>Address</label>
            <span>{{ getAddress() }}</span>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-raised-button color="primary" (click)="onEdit()">
        <mat-icon>edit</mat-icon>
        Edit Employee
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--spacing-6);
      border-bottom: var(--border-default) solid var(--border-secondary);

      h2 {
        display: flex;
        align-items: center;
        gap: var(--spacing-4);
        margin: 0;

        .employee-avatar-large {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--action-primary);
          color: var(--text-on-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
        }

        .employee-name {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
        }

        .employee-role {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-secondary);
          text-transform: uppercase;
        }
      }
    }

    .dialog-content {
      padding: var(--spacing-6);
      max-height: 70vh;
      overflow-y: auto;
    }

    .info-section {
      margin: var(--spacing-6) 0;

      h3 {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
        margin: 0 0 var(--spacing-4) 0;

        mat-icon {
          color: var(--action-primary);
          font-size: var(--font-size-xl);
          width: var(--font-size-xl);
          height: var(--font-size-xl);
        }
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-6);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);

        &.full-width {
          grid-column: 1 / -1;
        }

        label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        span {
          font-size: var(--font-size-md);
          color: var(--text-primary);
          font-weight: var(--font-weight-medium);
        }
      }
    }

    mat-divider {
      margin: var(--spacing-6) 0;
    }

    mat-dialog-actions {
      padding: var(--spacing-4) var(--spacing-6);
      border-top: var(--border-default) solid var(--border-secondary);
    }
  `]
})
export class EmployeeViewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EmployeeViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public employee: User
  ) {}

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  getAddress(): string {
    if (!this.employee.address) return 'N/A';
    if (typeof this.employee.address === 'string') {
      return this.employee.address;
    }
    return `${this.employee.address.street || ''}, ${this.employee.address.city || ''}, ${this.employee.address.state || ''} ${this.employee.address.zipCode || ''}`.trim();
  }

  onEdit(): void {
    this.dialogRef.close({ action: 'edit', employee: this.employee });
  }
}

