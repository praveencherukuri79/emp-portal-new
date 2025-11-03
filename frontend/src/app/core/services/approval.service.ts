import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApprovalRequest, 
  ApprovalType, 
  ApprovalStatus,
  BulkApprovalRequest 
} from '../models/approval.model';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
  private apiUrl = `${environment.apiUrl}/approvals`;

  constructor(private http: HttpClient) {}

  getPendingApprovals(type?: ApprovalType): Observable<ApiResponse<ApprovalRequest[]>> {
    let params = new HttpParams();
    
    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<ApiResponse<ApprovalRequest[]>>(`${this.apiUrl}/pending`, { params });
  }

  getMyApprovalHistory(status?: ApprovalStatus): Observable<ApiResponse<ApprovalRequest[]>> {
    let params = new HttpParams();
    
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<ApprovalRequest[]>>(`${this.apiUrl}/history`, { params });
  }

  approveRequest(approvalId: string, comments?: string): Observable<ApiResponse<ApprovalRequest>> {
    return this.http.post<ApiResponse<ApprovalRequest>>(
      `${this.apiUrl}/${approvalId}/approve`,
      { comments }
    );
  }

  rejectRequest(approvalId: string, reason: string): Observable<ApiResponse<ApprovalRequest>> {
    return this.http.post<ApiResponse<ApprovalRequest>>(
      `${this.apiUrl}/${approvalId}/reject`,
      { reason }
    );
  }

  bulkApprove(request: BulkApprovalRequest): Observable<ApiResponse<{ processed: number; failed: number }>> {
    return this.http.post<ApiResponse<{ processed: number; failed: number }>>(
      `${this.apiUrl}/bulk`,
      request
    );
  }

  getApprovalTypeName(type: ApprovalType): string {
    const names: Record<ApprovalType, string> = {
      [ApprovalType.TIMESHEET]: 'Timesheet',
      [ApprovalType.LEAVE]: 'Leave Request'
    };
    return names[type];
  }

  getStatusColor(status: ApprovalStatus): string {
    switch (status) {
      case ApprovalStatus.PENDING:
        return 'warning';
      case ApprovalStatus.APPROVED:
        return 'success';
      case ApprovalStatus.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
