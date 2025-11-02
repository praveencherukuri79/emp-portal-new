import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type DocumentCategory = 'Visa' | 'Passport' | 'Contract' | 'Certification' | 'Tax' | 'Insurance' | 'Other';

export interface Document {
  _id?: string;
  fileName: string;
  originalName: string;
  category: DocumentCategory;
  description?: string;
  documentNumber?: string;
  issueDate?: Date | string;
  expiryDate?: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/documents`;

  uploadDocument(file: File, metadata: Partial<Document>): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getMyDocuments(params?: { category?: DocumentCategory; expiringSoon?: boolean }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.expiringSoon !== undefined) httpParams = httpParams.set('expiringSoon', params.expiringSoon.toString());
    return this.http.get(`${this.apiUrl}/my-documents`, { params: httpParams });
  }

  getAllDocuments(params?: { userId?: string; category?: DocumentCategory; expiringSoon?: boolean }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.userId) httpParams = httpParams.set('userId', params.userId);
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.expiringSoon !== undefined) httpParams = httpParams.set('expiringSoon', params.expiringSoon.toString());
    return this.http.get(this.apiUrl, { params: httpParams });
  }

  getExpiringDocuments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/expiring`);
  }

  getSharedDocuments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/shared`);
  }

  updateDocument(documentId: string, updates: Partial<Document>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${documentId}`, updates);
  }

  deleteDocument(documentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${documentId}`);
  }

  shareDocument(documentId: string, userIds: string[], canDownload: boolean = true): Observable<any> {
    return this.http.post(`${this.apiUrl}/${documentId}/share`, { userIds, canDownload });
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${documentId}/download`, { responseType: 'blob' });
  }
}

