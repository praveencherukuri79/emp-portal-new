import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentService } from '../../core/services/document.service';
import { UINotificationService } from '../../core/services/notification.service';
import { Document, DocumentCategory } from '../../core/models/document.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent implements OnInit {
  private documentService = inject(DocumentService);
  private fb = inject(FormBuilder);
  private uiNotification = inject(UINotificationService);

  // Signals for reactive state
  documents = signal<Document[]>([]);
  expiringDocuments = signal<Document[]>([]);
  loading = signal(false);
  uploading = signal(false);

  // Upload form
  uploadForm: FormGroup;
  selectedFile: File | null = null;

  // Document categories
  documentCategories = Object.values(DocumentCategory);

  // Table columns
  displayedColumns = ['title', 'category', 'uploadedAt', 'expiryDate', 'status', 'actions'];
  expiryColumns = ['title', 'category', 'expiryDate', 'daysRemaining', 'actions'];

  constructor() {
    this.uploadForm = this.fb.group({
      category: ['', Validators.required],
      title: ['', Validators.required],
      expiryDate: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadDocuments();
    // Don't load expiring documents separately - we'll filter from loaded documents
  }

  loadDocuments(): void {
    this.loading.set(true);
    this.documentService.getMyDocuments().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.documents.set(response.data);
          // Filter expiring documents (within 30 days) from loaded documents
          const expiringDocs = response.data.filter((doc: Document) => {
            if (!doc.expiryDate) return false;
            const daysRemaining = this.getDaysRemaining(doc.expiryDate as string);
            return daysRemaining >= 0 && daysRemaining <= 30;
          });
          this.expiringDocuments.set(expiringDocs);
        } else {
          this.documents.set([]);
          this.expiringDocuments.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.documents.set([]);
        this.expiringDocuments.set([]);
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onUpload(): void {
    if (!this.uploadForm.valid || !this.selectedFile) {
      return;
    }

    this.uploading.set(true);
    const uploadRequest = {
      file: this.selectedFile,
      category: this.uploadForm.value.category,
      title: this.uploadForm.value.title,
      expiryDate: this.uploadForm.value.expiryDate,
      notes: this.uploadForm.value.notes
    };

    this.documentService.uploadDocument(uploadRequest).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.uploading.set(false);
          this.uploadForm.reset();
          this.selectedFile = null;
          this.loadDocuments(); // This will also update expiring documents
        } else {
          this.uploading.set(false);
          console.error('Document upload failed:', response);
        }
      },
      error: (error) => {
        console.error('Error uploading document:', error);
        this.uploading.set(false);
      }
    });
  }

  downloadDocument(doc: Document): void {
    if (!doc._id) return;
    
    this.documentService.downloadDocument(doc._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
      }
    });
  }

  async deleteDocument(docId: string): Promise<void> {
    const confirmed = await this.uiNotification.confirm({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'warn'
    });

    if (!confirmed) return;

    this.documentService.deleteDocument(docId).subscribe({
      next: () => {
        this.loadDocuments(); // This will also update expiring documents
        this.uiNotification.showSuccess('Document deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting document:', error);
        this.uiNotification.showError('Failed to delete document');
      }
    });
  }

  getDaysRemaining(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getExpiryStatus(expiryDate: string | undefined): 'valid' | 'warning' | 'expired' | 'none' {
    if (!expiryDate) return 'none';
    const daysRemaining = this.getDaysRemaining(expiryDate);
    if (daysRemaining < 0) return 'expired';
    if (daysRemaining <= 30) return 'warning';
    return 'valid';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
