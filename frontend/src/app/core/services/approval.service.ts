import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApprovalType, ApprovalStatus, IApprovalRequest, IBulkApprovalRequest } from '@shared/types';

export interface ApprovalRequest extends IApprovalRequest {}
export interface BulkApprovalRequest extends IBulkApprovalRequest {}

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
  private http = inject(HttpClient);
  // Approvals are handled through timesheet and leave services
  // This service is for unified approval management if needed
  private baseUrl = `${environment.apiUrl}/approvals`;

  getPendingApprovals(type?: ApprovalType): Observable<any> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    return this.http.get(`${this.baseUrl}/pending`, { params });
  }

  getMyApprovalHistory(status?: ApprovalStatus): Observable<any> {
    let params = new HttpParams();
    if (status) params = params.set('status', status.toLowerCase());
    return this.http.get(`${this.baseUrl}/history`, { params });
  }

  approveRequest(approvalId: string, comments?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${approvalId}/approve`, { comments });
  }

  rejectRequest(approvalId: string, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${approvalId}/reject`, { reason });
  }

  bulkApprove(request: BulkApprovalRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk`, request);
  }
}
