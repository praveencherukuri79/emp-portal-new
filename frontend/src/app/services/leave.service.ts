import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LeaveType, LeaveStatus, ILeaveRequestDTO, ILeaveBalance } from '@shared/types';
import { IUpdateLeaveRequestRequest, ICancelLeaveRequest, IApproveLeaveRequest, IRejectLeaveRequest } from '@shared/types/requests';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { ILeaveRequestResponse, ILeaveBalanceResponse, ILeaveCalendarResponse, ILeaveStatisticsResponse } from '@shared/types/responses';

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

  createLeaveRequest(request: LeaveRequest): Observable<IApiResponse<ILeaveRequestResponse>> {
    const dto: ILeaveRequestDTO = {
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      isHalfDay: request.isHalfDay,
      halfDayPeriod: request.halfDayPeriod?.toLowerCase() as 'morning' | 'afternoon' | undefined,
      reason: request.reason
    };
    return this.http.post<IApiResponse<ILeaveRequestResponse>>(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.CREATE}`, dto);
  }

  getMyLeaveRequests(params?: { status?: LeaveStatus; leaveType?: LeaveType }): Observable<IApiResponse<ILeaveRequestResponse[]>> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status.toLowerCase());
    if (params?.leaveType) httpParams = httpParams.set('leaveType', params.leaveType.toLowerCase());
    return this.http.get<IApiResponse<ILeaveRequestResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.MY_REQUESTS}`, { params: httpParams });
  }

  getMyLeaveBalance(): Observable<IApiResponse<ILeaveBalanceResponse>> {
    return this.http.get<IApiResponse<ILeaveBalanceResponse>>(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.MY_BALANCE}`);
  }

  getLeaveCalendar(params?: { startDate?: string; endDate?: string }): Observable<IApiResponse<ILeaveCalendarResponse[]>> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<IApiResponse<ILeaveCalendarResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.CALENDAR}`, { params: httpParams });
  }

  updateLeaveRequest(leaveId: string, updates: Partial<LeaveRequest>): Observable<IApiResponse<ILeaveRequestResponse>> {
    const body: IUpdateLeaveRequestRequest = {};
    if (updates.leaveType) body.leaveType = updates.leaveType;
    if (updates.startDate) body.startDate = updates.startDate;
    if (updates.endDate) body.endDate = updates.endDate;
    if (updates.isHalfDay !== undefined) body.isHalfDay = updates.isHalfDay;
    if (updates.halfDayPeriod) body.halfDayPeriod = updates.halfDayPeriod.toLowerCase() as 'morning' | 'afternoon';
    if (updates.reason) body.reason = updates.reason;
    return this.http.put<IApiResponse<ILeaveRequestResponse>>(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.BY_ID(leaveId)}`, body);
  }

  cancelLeaveRequest(leaveId: string, cancellationReason?: string): Observable<IApiResponse<ILeaveRequestResponse>> {
    const body: ICancelLeaveRequest = { cancellationReason };
    return this.http.put<IApiResponse<ILeaveRequestResponse>>(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.CANCEL(leaveId)}`, body);
  }

  getPendingApprovals(): Observable<IApiResponse<ILeaveRequestResponse[]>> {
    return this.http.get<IApiResponse<ILeaveRequestResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.PENDING_APPROVALS}`);
  }

  approveLeaveRequest(leaveId: string, comments?: string): Observable<IApiResponse<ILeaveRequestResponse>> {
    const body: IApproveLeaveRequest = { comments };
    return this.http.put<IApiResponse<ILeaveRequestResponse>>(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.APPROVE(leaveId)}`, body);
  }

  rejectLeaveRequest(leaveId: string, reason: string): Observable<IApiResponse<ILeaveRequestResponse>> {
    const body: IRejectLeaveRequest = { comments: reason };
    return this.http.put<IApiResponse<ILeaveRequestResponse>>(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.REJECT(leaveId)}`, body);
  }

  getLeaveStatistics(params?: { userId?: string; year?: number }): Observable<IApiResponse<ILeaveStatisticsResponse>> {
    let httpParams = new HttpParams();
    if (params?.userId) httpParams = httpParams.set('userId', params.userId);
    if (params?.year) httpParams = httpParams.set('year', params.year.toString());
    return this.http.get<IApiResponse<ILeaveStatisticsResponse>>(`${environment.apiUrl}${API_ENDPOINTS.LEAVES.STATISTICS}`, { params: httpParams });
  }
}
