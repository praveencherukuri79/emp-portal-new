import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Document, 
  DocumentUploadRequest, 
  DocumentFilters,
  DocumentCategory,
  DocumentStatus 
} from '../models/document.model';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getMyDocuments(filters?: DocumentFilters): Observable<ApiResponse<Document[]>> {
    let params = new HttpParams();
    
    if (filters?.category) {
      params = params.set('category', filters.category);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<ApiResponse<Document[]>>(`${this.apiUrl}/my-documents`, { params });
  }

  uploadDocument(request: DocumentUploadRequest): Observable<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('category', request.category);
    formData.append('title', request.title);
    
    if (request.issueDate) {
      formData.append('issueDate', request.issueDate);
    }
    if (request.expiryDate) {
      formData.append('expiryDate', request.expiryDate);
    }
    if (request.notes) {
      formData.append('notes', request.notes);
    }

    return this.http.post<ApiResponse<Document>>(`${this.apiUrl}/upload`, formData);
  }

  updateDocument(documentId: string, updates: Partial<Document>): Observable<ApiResponse<Document>> {
    return this.http.put<ApiResponse<Document>>(`${this.apiUrl}/${documentId}`, updates);
  }

  deleteDocument(documentId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${documentId}`);
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${documentId}/download`, {
      responseType: 'blob'
    });
  }

  getExpiringDocuments(daysAhead: number = 30): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(`${this.apiUrl}/expiring?days=${daysAhead}`);
  }

  getCategoryName(category: DocumentCategory): string {
    const names: Record<DocumentCategory, string> = {
      [DocumentCategory.PASSPORT]: 'Passport',
      [DocumentCategory.VISA]: 'Visa',
      [DocumentCategory.DRIVING_LICENSE]: 'Driving License',
      [DocumentCategory.ID_CARD]: 'ID Card',
      [DocumentCategory.CONTRACT]: 'Contract',
      [DocumentCategory.CERTIFICATE]: 'Certificate',
      [DocumentCategory.OTHER]: 'Other'
    };
    return names[category];
  }

  getStatusColor(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.ACTIVE:
        return 'success';
      case DocumentStatus.EXPIRING_SOON:
        return 'warning';
      case DocumentStatus.EXPIRED:
        return 'error';
      default:
        return 'default';
    }
  }

  calculateStatus(expiryDate?: Date | string): DocumentStatus {
    if (!expiryDate) return DocumentStatus.ACTIVE;

    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return DocumentStatus.EXPIRED;
    } else if (daysUntilExpiry <= 30) {
      return DocumentStatus.EXPIRING_SOON;
    } else {
      return DocumentStatus.ACTIVE;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
