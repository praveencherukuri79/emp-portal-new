import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LeaveRequest,
  LeaveBalance,
  CreateLeaveRequest,
  ApproveRejectLeaveRequest,
  LeaveType
} from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private readonly API_URL = `${environment.apiUrl}/leaves`;

  constructor(private http: HttpClient) {}

  /**
   * Get all leave requests for current user
   */
  getMyLeaves(): Observable<{ data: LeaveRequest[] }> {
    return this.http.get<{ data: LeaveRequest[] }>(`${this.API_URL}/my-requests`);
  }

  /**
   * Get leave balances for current user
   */
  getMyBalances(): Observable<{ data: LeaveBalance[] }> {
    return this.http.get<{ data: LeaveBalance[] }>(`${this.API_URL}/my-balance`);
  }

  /**
   * Create a new leave request
   */
  createLeaveRequest(request: CreateLeaveRequest): Observable<{ data: LeaveRequest }> {
    return this.http.post<{ data: LeaveRequest }>(this.API_URL, request);
  }

  /**
   * Cancel a pending leave request
   */
  cancelLeave(leaveId: string): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${leaveId}/cancel`, {});
  }

  /**
   * Get pending leave requests for approval (Supervisor/HR/Admin)
   */
  getPendingApprovals(): Observable<{ data: LeaveRequest[] }> {
    return this.http.get<{ data: LeaveRequest[] }>(`${this.API_URL}/approvals/pending`);
  }

  /**
   * Approve or reject a leave request (Supervisor/HR/Admin)
   */
  approveRejectLeave(request: ApproveRejectLeaveRequest): Observable<{ data: LeaveRequest }> {
    const { leaveId, action, reason } = request;
    return this.http.put<{ data: LeaveRequest }>(`${this.API_URL}/${leaveId}/${action}`, { reason });
  }

  /**
   * Get all leaves for calendar view
   */
  getCalendarLeaves(startDate: string, endDate: string): Observable<{ data: LeaveRequest[] }> {
    return this.http.get<{ data: LeaveRequest[] }>(
      `${this.API_URL}/calendar?start=${startDate}&end=${endDate}`
    );
  }

  /**
   * Calculate number of days between two dates (excluding weekends)
   */
  calculateLeaveDays(startDate: Date, endDate: Date, halfDay: string): number {
    let days = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }

    // Adjust for half-day
    if (halfDay === 'morning' || halfDay === 'afternoon') {
      days = days - 0.5;
    }

    return days;
  }

  /**
   * Format date to YYYY-MM-DD for API
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get leave type display name
   */
  getLeaveTypeName(type: LeaveType): string {
    const names: Record<LeaveType, string> = {
      [LeaveType.ANNUAL]: 'Annual Leave',
      [LeaveType.SICK]: 'Sick Leave',
      [LeaveType.PERSONAL]: 'Personal Leave',
      [LeaveType.UNPAID]: 'Unpaid Leave',
      [LeaveType.MATERNITY]: 'Maternity Leave',
      [LeaveType.PATERNITY]: 'Paternity Leave'
    };
    return names[type];
  }
}
