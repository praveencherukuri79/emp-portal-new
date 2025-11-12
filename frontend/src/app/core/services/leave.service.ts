import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaveType, LeaveStatus, ILeaveRequestDTO } from '@shared/types';
import { IUpdateLeaveRequestRequest, ICancelLeaveRequest, IApproveLeaveRequest, IRejectLeaveRequest } from '@shared/types/requests';
import { API_ENDPOINTS } from '@shared/types/constants';

export interface LeaveRequest extends ILeaveRequestDTO {
  _id?: string;
  status?: LeaveStatus;
  totalDays?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.LEAVES.CREATE}`;

  createLeaveRequest(request: LeaveRequest): Observable<any> {
    const dto: ILeaveRequestDTO = {
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      isHalfDay: request.isHalfDay,
      halfDayPeriod: request.halfDayPeriod?.toLowerCase() as 'morning' | 'afternoon' | undefined,
      reason: request.reason
    };
    return this.http.post(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.CREATE}`, dto);
  }

  getMyLeaveRequests(params?: { status?: LeaveStatus; leaveType?: LeaveType }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status.toLowerCase());
    if (params?.leaveType) httpParams = httpParams.set('leaveType', params.leaveType.toLowerCase());
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.MY_REQUESTS}`, { params: httpParams });
  }

  getMyLeaveBalance(): Observable<any> {
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.MY_BALANCE}`);
  }

  getLeaveCalendar(params?: { startDate?: string; endDate?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.CALENDAR}`, { params: httpParams });
  }

  updateLeaveRequest(leaveId: string, updates: Partial<LeaveRequest>): Observable<any> {
    const body: IUpdateLeaveRequestRequest = {};
    if (updates.leaveType) body.leaveType = updates.leaveType;
    if (updates.startDate) body.startDate = updates.startDate;
    if (updates.endDate) body.endDate = updates.endDate;
    if (updates.isHalfDay !== undefined) body.isHalfDay = updates.isHalfDay;
    if (updates.halfDayPeriod) body.halfDayPeriod = updates.halfDayPeriod.toLowerCase() as 'morning' | 'afternoon';
    if (updates.reason) body.reason = updates.reason;
    return this.http.put(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.BY_ID(leaveId)}`, body);
  }

  cancelLeaveRequest(leaveId: string, cancellationReason?: string): Observable<any> {
    const body: ICancelLeaveRequest = { cancellationReason };
    return this.http.put(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.CANCEL(leaveId)}`, body);
  }

  getPendingApprovals(): Observable<any> {
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.PENDING_APPROVALS}`);
  }

  approveLeaveRequest(leaveId: string, comments?: string): Observable<any> {
    const body: IApproveLeaveRequest = { comments };
    return this.http.put(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.APPROVE(leaveId)}`, body);
  }

  rejectLeaveRequest(leaveId: string, reason: string): Observable<any> {
    const body: IRejectLeaveRequest = { comments: reason };
    return this.http.put(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.REJECT(leaveId)}`, body);
  }

  getLeaveStatistics(params?: { userId?: string; year?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.userId) httpParams = httpParams.set('userId', params.userId);
    if (params?.year) httpParams = httpParams.set('year', params.year.toString());
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.STATISTICS}`, { params: httpParams });
  }
}
