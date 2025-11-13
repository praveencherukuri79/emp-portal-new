import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentCategory } from '@shared/types';
import { IUpdateDocumentRequest, IShareDocumentRequest } from '@shared/types/requests';
import { API_ENDPOINTS, DOCUMENT_CATEGORY_LABELS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { IDocumentResponse } from '@shared/types/responses';
import { buildHttpParams } from '../../shared/utils/http.util';

export interface Document {
  _id?: string;
  userId?: string | { _id: string; firstName: string; lastName: string; email?: string; employeeId?: string };
  fileName: string;
  originalName: string;
  category: DocumentCategory;
  description?: string;
  documentNumber?: string;
  issueDate?: Date | string;
  expiryDate?: Date | string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  isPrivate?: boolean;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  title?: string;
  uploadedAt?: Date | string;
}

export interface DocumentFilters {
  category?: DocumentCategory;
  status?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.ALL}`;

  getMyDocuments(filters?: DocumentFilters): Observable<IApiResponse<IDocumentResponse[]>> {
    const params = buildHttpParams({
      category: filters?.category?.toLowerCase(),
      status: filters?.status?.toLowerCase(),
      search: filters?.search
    });
    return this.http.get<IApiResponse<IDocumentResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.MY_DOCUMENTS}`, { params });
  }

  getAllDocuments(filters?: DocumentFilters & { userId?: string; expiringSoon?: boolean }): Observable<IApiResponse<IDocumentResponse[]>> {
    const params = buildHttpParams({
      category: filters?.category?.toLowerCase(),
      userId: filters?.userId,
      expiringSoon: filters?.expiringSoon,
      search: filters?.search
    });
    return this.http.get<IApiResponse<IDocumentResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.ALL}`, { params });
  }

  uploadDocument(file: File, metadata: Partial<Document>): Observable<IApiResponse<IDocumentResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'category' && typeof value === 'string') {
          formData.append(key, value.toLowerCase());
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return this.http.post<IApiResponse<IDocumentResponse>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.UPLOAD}`, formData);
  }

  updateDocument(documentId: string, updates: Partial<Document>): Observable<IApiResponse<IDocumentResponse>> {
    const body: IUpdateDocumentRequest = {};
    if (updates.category) body.category = updates.category;
    if (updates.description) body.description = updates.description;
    if (updates.documentNumber) body.documentNumber = updates.documentNumber;
    if (updates.issueDate) body.issueDate = updates.issueDate;
    if (updates.expiryDate) body.expiryDate = updates.expiryDate;
    return this.http.put<IApiResponse<IDocumentResponse>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.BY_ID(documentId)}`, body);
  }

  deleteDocument(documentId: string): Observable<IApiResponse<null>> {
    return this.http.delete<IApiResponse<null>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.BY_ID(documentId)}`);
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.DOWNLOAD(documentId)}`, { responseType: 'blob' });
  }

  getExpiringDocuments(daysAhead: number = 30): Observable<IApiResponse<IDocumentResponse[]>> {
    return this.http.get<IApiResponse<IDocumentResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.EXPIRING}?days=${daysAhead}`);
  }

  getSharedDocuments(): Observable<IApiResponse<IDocumentResponse[]>> {
    return this.http.get<IApiResponse<IDocumentResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.SHARED}`);
  }

  shareDocument(documentId: string, userIds: string[], canDownload: boolean = true): Observable<IApiResponse<null>> {
    const body: IShareDocumentRequest = { userIds, canDownload };
    return this.http.post<IApiResponse<null>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.SHARE(documentId)}`, body);
  }

  getCategoryName(category: DocumentCategory): string {
    const categoryUpper = category.toUpperCase() as keyof typeof DOCUMENT_CATEGORY_LABELS;
    return DOCUMENT_CATEGORY_LABELS[categoryUpper] || category;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
