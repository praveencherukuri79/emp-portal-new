import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DocumentCategory } from '@shared/types';
import { IUpdateDocumentRequest, IShareDocumentRequest } from '@shared/types/requests';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { IDocumentResponse } from '@shared/types/responses';

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
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.ALL}`;

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

  getMyDocuments(params?: { category?: DocumentCategory; expiringSoon?: boolean }): Observable<IApiResponse<IDocumentResponse[]>> {
    let httpParams = new HttpParams();
    if (params?.category) httpParams = httpParams.set('category', params.category.toLowerCase());
    if (params?.expiringSoon !== undefined) httpParams = httpParams.set('expiringSoon', params.expiringSoon.toString());
    return this.http.get<IApiResponse<IDocumentResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.MY_DOCUMENTS}`, { params: httpParams });
  }

  getAllDocuments(params?: { userId?: string; category?: DocumentCategory; expiringSoon?: boolean }): Observable<IApiResponse<IDocumentResponse[]>> {
    let httpParams = new HttpParams();
    if (params?.userId) httpParams = httpParams.set('userId', params.userId);
    if (params?.category) httpParams = httpParams.set('category', params.category.toLowerCase());
    if (params?.expiringSoon !== undefined) httpParams = httpParams.set('expiringSoon', params.expiringSoon.toString());
    return this.http.get<IApiResponse<IDocumentResponse[]>>(this.baseUrl, { params: httpParams });
  }

  getExpiringDocuments(): Observable<IApiResponse<IDocumentResponse[]>> {
    return this.http.get<IApiResponse<IDocumentResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.EXPIRING}`);
  }

  getSharedDocuments(): Observable<IApiResponse<IDocumentResponse[]>> {
    return this.http.get<IApiResponse<IDocumentResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.SHARED}`);
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

  shareDocument(documentId: string, userIds: string[], canDownload: boolean = true): Observable<IApiResponse<null>> {
    const body: IShareDocumentRequest = { userIds, canDownload };
    return this.http.post<IApiResponse<null>>(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.SHARE(documentId)}`, body);
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.DOCUMENTS.DOWNLOAD(documentId)}`, { responseType: 'blob' });
  }
}
