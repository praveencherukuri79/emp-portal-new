import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { EMPLOYMENT_TYPE_LABELS, ROLE_LABELS } from '@shared/types/constants';

@Component({
  selector: 'app-employee-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="dialog-header">
      <div class="header-content">
        <div class="employee-avatar-large">{{ getInitials() }}</div>
        <div>
          <h2 mat-dialog-title>{{ employee.fullName || (employee.firstName + ' ' + employee.lastName) }}</h2>
          <p class="employee-email">{{ employee.email }}</p>
        </div>
      </div>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <div class="info-grid">
        <div class="info-section">
          <h3>Employment Details</h3>
          <div class="info-item">
            <span class="label">Department:</span>
            <span class="value">{{ employee.department || employee.departmentName || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Role:</span>
            <span class="value">
              <mat-chip>{{ getRoleLabel() }}</mat-chip>
            </span>
          </div>
          <div class="info-item">
            <span class="label">Employment Type:</span>
            <span class="value">{{ getEmploymentType() }}</span>
          </div>
          <div class="info-item">
            <span class="label">Employee ID:</span>
            <span class="value">{{ employee.employeeId || 'N/A' }}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Contact & Status</h3>
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{{ employee.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">Status:</span>
            <span class="value">
              <mat-chip [color]="employee.isActive ? 'primary' : 'warn'">
                {{ employee.isActive ? 'Active' : 'Inactive' }}
              </mat-chip>
            </span>
          </div>
          <div class="info-item">
            <span class="label">Joining Date:</span>
            <span class="value">{{ employee.joiningDate || 'N/A' }}</span>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--spacing-6);
      border-bottom: 1px solid var(--border-secondary);

      .header-content {
        display: flex;
        gap: var(--spacing-4);
        align-items: center;

        .employee-avatar-large {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
          color: var(--text-on-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-2xl);
        }

        h2 {
          margin: 0;
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
        }

        .employee-email {
          margin: var(--spacing-1) 0 0 0;
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }
      }
    }

    .dialog-content {
      padding: var(--spacing-6);
      max-height: 60vh;
      overflow-y: auto;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-8);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .info-section {
      h3 {
        margin: 0 0 var(--spacing-4) 0;
        color: var(--text-primary);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        padding-bottom: var(--spacing-2);
        border-bottom: 2px solid var(--border-secondary);
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-3) 0;
        border-bottom: 1px solid var(--border-secondary);

        &:last-child {
          border-bottom: none;
        }

        .label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          font-weight: var(--font-weight-medium);
        }

        .value {
          font-size: var(--font-size-md);
          color: var(--text-primary);
          font-weight: var(--font-weight-medium);
        }
      }
    }

    mat-dialog-actions {
      padding: var(--spacing-4) var(--spacing-6);
      border-top: 1px solid var(--border-secondary);
    }
  `]
})
export class EmployeeDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EmployeeDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public employee: any
  ) { }

  getInitials(): string {
    if (this.employee.firstName && this.employee.lastName) {
      return `${this.employee.firstName.charAt(0)}${this.employee.lastName.charAt(0)}`.toUpperCase();
    }
    const name = this.employee.fullName || 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  getRoleLabel(): string {
    const role = this.employee.role?.toUpperCase();
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || this.employee.role || 'N/A';
  }

  getEmploymentType(): string {
    const type = this.employee.employmentType;
    if (!type) return 'N/A';
    const key = type.replace(/-/, '_').toUpperCase();
    return EMPLOYMENT_TYPE_LABELS[key as keyof typeof EMPLOYMENT_TYPE_LABELS] || type;
  }
}


