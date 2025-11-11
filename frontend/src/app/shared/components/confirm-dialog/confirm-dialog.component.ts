import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'warn' | 'accent';
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  inputValue: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent, boolean | { reason: string }>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    if (this.data.showInput && this.inputValue.trim()) {
      this.dialogRef.close({ reason: this.inputValue.trim() });
    } else if (this.data.showInput && !this.inputValue.trim()) {
      // Don't close if input is required but empty
      return;
    } else {
      this.dialogRef.close(true);
    }
  }

  get confirmText(): string {
    return this.data.confirmText || 'Confirm';
  }

  get cancelText(): string {
    return this.data.cancelText || 'Cancel';
  }

  get confirmColor(): 'primary' | 'warn' | 'accent' {
    return this.data.confirmColor || 'primary';
  }
}

