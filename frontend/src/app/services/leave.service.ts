import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type LeaveType = 'Annual' | 'Sick' | 'Personal' | 'Unpaid' | 'Maternity' | 'Paternity';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  _id?: string;
  leaveType: LeaveType;
  startDate: Date | string;
  endDate: Date | string;
  isHalfDay?: boolean;
  halfDayPeriod?: 'Morning' | 'Afternoon';
  reason: string;
  status?: LeaveStatus;
  totalDays?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/leaves`;

  createLeaveRequest(request: LeaveRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  getMyLeaveRequests(params?: { status?: LeaveStatus; leaveType?: LeaveType }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.leaveType) httpParams = httpParams.set('leaveType', params.leaveType);
    return this.http.get(`${this.apiUrl}/my-requests`, { params: httpParams });
  }

  getMyLeaveBalance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-balance`);
  }

  getLeaveCalendar(params?: { startDate?: string; endDate?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get(`${this.apiUrl}/calendar`, { params: httpParams });
  }

  updateLeaveRequest(leaveId: string, updates: Partial<LeaveRequest>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${leaveId}`, updates);
  }

  cancelLeaveRequest(leaveId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${leaveId}/cancel`, {});
  }

  getPendingApprovals(): Observable<any> {
    return this.http.get(`${this.apiUrl}/approvals/pending`);
  }

  approveLeaveRequest(leaveId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${leaveId}/approve`, {});
  }

  rejectLeaveRequest(leaveId: string, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${leaveId}/reject`, { reason });
  }

  getLeaveStatistics(params?: { userId?: string; year?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.userId) httpParams = httpParams.set('userId', params.userId);
    if (params?.year) httpParams = httpParams.set('year', params.year.toString());
    return this.http.get(`${this.apiUrl}/statistics`, { params: httpParams });
  }
}

