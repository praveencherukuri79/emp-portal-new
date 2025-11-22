import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApprovalType, ApprovalStatus, IApprovalRequest, IBulkApprovalRequest } from '@shared/types';
import { IApiResponse } from '@shared/types';
import { IPendingApprovalsResponse, IApprovalHistoryResponse, IApprovalResponse } from '@shared/types/responses';
import { buildHttpParams } from '../../shared/utils/http.util';

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

  getPendingApprovals(type?: ApprovalType): Observable<IApiResponse<IPendingApprovalsResponse>> {
    const params = buildHttpParams({ type });
    return this.http.get<IApiResponse<IPendingApprovalsResponse>>(`${this.baseUrl}/pending`, { params });
  }

  getMyApprovalHistory(status?: ApprovalStatus): Observable<IApiResponse<IApprovalHistoryResponse>> {
    const params = buildHttpParams({ status: status?.toLowerCase() });
    return this.http.get<IApiResponse<IApprovalHistoryResponse>>(`${this.baseUrl}/history`, { params });
  }

  approveRequest(approvalId: string, comments?: string): Observable<IApiResponse<IApprovalResponse>> {
    return this.http.post<IApiResponse<IApprovalResponse>>(`${this.baseUrl}/${approvalId}/approve`, { comments });
  }

  rejectRequest(approvalId: string, reason: string): Observable<IApiResponse<IApprovalResponse>> {
    return this.http.post<IApiResponse<IApprovalResponse>>(`${this.baseUrl}/${approvalId}/reject`, { reason });
  }

  bulkApprove(request: BulkApprovalRequest): Observable<IApiResponse<{ count: number }>> {
    return this.http.post<IApiResponse<{ count: number }>>(`${this.baseUrl}/bulk`, request);
  }
}

