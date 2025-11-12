import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentService } from '../../../core/services/document.service';
import { UINotificationService } from '../../../core/services/notification.service';
import { PermissionService } from '../../../core/services/permission.service';
import { UserService } from '../../../services/user.service';
import { DocumentCategory } from '../../../core/models/document.model';
import { Document } from '../../../core/services/document.service';
import { User } from '../../../core/models/user.model';
import { DocumentPreviewDialogComponent, DocumentPreviewData } from '../../documents/document-preview-dialog.component';
import { Permission } from '@shared/types/permissions';

@Component({
  selector: 'app-hr-documents',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './hr-documents.component.html',
  styleUrl: './hr-documents.component.scss'
})
export class HrDocumentsComponent implements OnInit {
  private documentService = inject(DocumentService);
  private userService = inject(UserService);
  private uiNotification = inject(UINotificationService);
  private dialog = inject(MatDialog);
  protected permissions = inject(PermissionService);

  // Feature flags (configuration-based)
  canViewAllDocuments = this.permissions.canViewAllDocuments();
  canViewAllEmployees = this.permissions.canViewAllEmployees();

  // Signals for reactive state
  documents = signal<Document[]>([]);
  expiringDocuments = signal<Document[]>([]);
  loading = signal(false);
  loadingEmployees = signal(false);
  
  // Employee selection
  employees = signal<User[]>([]);
  selectedEmployeeId = signal<string | null>(null);
  selectedEmployeeName = signal<string>('');

  // Table columns
  displayedColumns = ['title', 'category', 'uploadedAt', 'expiryDate', 'status', 'actions'];
  expiryColumns = ['title', 'category', 'expiryDate', 'daysRemaining', 'actions'];

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loadingEmployees.set(true);
    this.userService.getAllUsers({ role: 'employee' }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const data = response.data as { users: User[]; pagination: any };
          const usersArray = (data.users && Array.isArray(data.users)) ? data.users : [];
          this.employees.set(usersArray);
        } else {
          this.employees.set([]);
        }
        this.loadingEmployees.set(false);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.employees.set([]);
        this.loadingEmployees.set(false);
      }
    });
  }

  onEmployeeSelected(event: any): void {
    const employeeId = event.value;
    this.selectedEmployeeId.set(employeeId);
    
    // Get employee name
    const employee = this.employees().find(e => e._id === employeeId);
    if (employee) {
      this.selectedEmployeeName.set(`${employee.firstName} ${employee.lastName}`);
    }
    
    if (employeeId) {
      this.loadDocuments();
    } else {
      this.documents.set([]);
      this.expiringDocuments.set([]);
    }
  }

  loadDocuments(): void {
    if (!this.selectedEmployeeId()) {
      this.documents.set([]);
      this.expiringDocuments.set([]);
      return;
    }

    this.loading.set(true);
    
    this.documentService.getAllDocuments({ userId: this.selectedEmployeeId()! }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.documents.set(response.data);
          // Filter expiring documents (within 30 days)
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

  previewDocument(doc: Document): void {
    if (!doc._id) return;
    
    this.documentService.downloadDocument(doc._id).subscribe({
      next: (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        
        const dialogData: DocumentPreviewData = {
          documentId: doc._id!,
          fileName: doc.originalName || doc.fileName,
          mimeType: doc.mimeType || '',
          blobUrl: blobUrl
        };
        
        const dialogRef = this.dialog.open(DocumentPreviewDialogComponent, {
          width: '90vw',
          maxWidth: '1200px',
          height: '90vh',
          data: dialogData,
          panelClass: 'document-preview-dialog'
        });

        dialogRef.afterClosed().subscribe(() => {
          URL.revokeObjectURL(blobUrl);
        });
      },
      error: (error) => {
        console.error('Error loading document for preview:', error);
        this.uiNotification.showError('Failed to load document preview');
      }
    });
  }

  downloadDocument(doc: Document): void {
    if (!doc._id) return;

    this.documentService.downloadDocument(doc._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.originalName || doc.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        this.uiNotification.showError('Failed to download document');
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

