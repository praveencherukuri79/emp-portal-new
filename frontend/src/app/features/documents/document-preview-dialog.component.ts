import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface DocumentPreviewData {
  documentId: string;
  fileName: string;
  mimeType: string;
  blobUrl: string;
}

@Component({
  selector: 'app-document-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>{{ getFileIcon() }}</mat-icon>
        {{ data.fileName }}
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading preview...</p>
        </div>
      } @else if (canPreview()) {
        @if (isPDF()) {
          <iframe 
            [src]="safeUrl()" 
            class="pdf-viewer"
            frameborder="0">
          </iframe>
        } @else if (isImage()) {
          <img 
            [src]="safeUrl()" 
            [alt]="data.fileName"
            class="image-viewer">
        }
      } @else {
        <div class="unsupported-state">
          <mat-icon>info</mat-icon>
          <h3>Preview Not Available</h3>
          <p>Preview is not available for {{ getFileType() }} files.</p>
          <p class="hint">Supported formats: PDF, JPG, PNG, GIF, WebP</p>
          <button mat-raised-button color="primary" (click)="download()">
            <mat-icon>download</mat-icon>
            Download File
          </button>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (canPreview()) {
        <button mat-button (click)="download()">
          <mat-icon>download</mat-icon>
          Download
        </button>
      }
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-6);
      border-bottom: 1px solid var(--border-secondary);

      h2 {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        margin: 0;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);

        mat-icon {
          color: var(--action-primary);
        }
      }
    }

    .dialog-content {
      padding: 0 !important;
      min-height: 500px;
      max-height: 80vh;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pdf-viewer {
      width: 100%;
      height: 80vh;
      border: none;
    }

    .image-viewer {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-4);
      padding: var(--spacing-12);

      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .unsupported-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-4);
      padding: var(--spacing-12);
      text-align: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--text-tertiary);
        opacity: 0.5;
      }

      h3 {
        margin: 0;
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
      }

      p {
        margin: 0;
        color: var(--text-secondary);
        
        &.hint {
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
        }
      }

      button {
        margin-top: var(--spacing-4);
      }
    }

    mat-dialog-actions {
      padding: var(--spacing-4) var(--spacing-6);
      border-top: 1px solid var(--border-secondary);
    }
  `]
})
export class DocumentPreviewDialogComponent {
  loading = signal(false);

  constructor(
    public dialogRef: MatDialogRef<DocumentPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DocumentPreviewData,
    private sanitizer: DomSanitizer
  ) { }

  isPDF(): boolean {
    return this.data.mimeType === 'application/pdf' || this.data.fileName.toLowerCase().endsWith('.pdf');
  }

  isImage(): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(this.data.mimeType.toLowerCase()) ||
      /\.(jpg|jpeg|png|gif|webp)$/i.test(this.data.fileName);
  }

  canPreview(): boolean {
    return this.isPDF() || this.isImage();
  }

  getFileType(): string {
    const ext = this.data.fileName.split('.').pop()?.toUpperCase();
    return ext || 'Unknown';
  }

  getFileIcon(): string {
    if (this.isPDF()) return 'picture_as_pdf';
    if (this.isImage()) return 'image';
    return 'description';
  }

  safeUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.data.blobUrl);
  }

  download(): void {
    const link = document.createElement('a');
    link.href = this.data.blobUrl;
    link.download = this.data.fileName;
    link.click();
  }
}

