import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TimesheetStatus, ITimesheetEntryDTO } from '@shared/types';
import { IBatchTimesheetEntriesRequest, IUpdateTimesheetEntryRequest, ISubmitWeekRequest, IApproveTimesheetEntriesRequest, IRejectTimesheetEntriesRequest } from '@shared/types/requests';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { ITimesheetEntryResponse, IWeeklyTimesheetResponse, ITimesheetHistoryResponse, IPendingTimesheetGroupResponse, ITimesheetApprovalActionResponse } from '@shared/types/responses';
import { ResponseHandler } from '../shared/utils';
import { buildHttpParams } from '../shared/utils/http.util';

export interface TimesheetEntry {
  _id?: string;
  date: Date | string;
  projectId?: string;
  project?: string;
  task?: string;
  description?: string;
  hours?: number;
  hoursWorked?: number;
  isBillable?: boolean;
  billable?: boolean;
  status?: TimesheetStatus;
}

export interface WeeklyTimesheet {
  weekStart: string;
  weekEnd: string;
  entries: TimesheetEntry[];
  totalHours: number;
  billableHours: number;
  status: TimesheetStatus;
}

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.ENTRIES}`;

  createEntry(entry: TimesheetEntry): Observable<IApiResponse<ITimesheetEntryResponse>> {
    const dto: ITimesheetEntryDTO = {
      date: entry.date,
      project: entry.projectId || entry.project || '',
      task: entry.task,
      description: entry.description,
      hours: entry.hours || entry.hoursWorked || 0,
      isBillable: entry.isBillable !== undefined ? entry.isBillable : (entry.billable !== undefined ? entry.billable : true)
    };
    return this.http.post<IApiResponse<ITimesheetEntryResponse>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.ENTRIES}`, dto)
      .pipe(catchError(ResponseHandler.handleError()));
  }

  batchCreateEntries(entries: TimesheetEntry[]): Observable<IApiResponse<ITimesheetEntryResponse[]>> {
    const dtos = entries.map(entry => ({
      date: entry.date,
      project: entry.projectId || entry.project || '',
      task: entry.task,
      description: entry.description,
      hours: entry.hours || entry.hoursWorked || 0,
      isBillable: entry.isBillable !== undefined ? entry.isBillable : (entry.billable !== undefined ? entry.billable : true)
    }));
    const body: IBatchTimesheetEntriesRequest = { entries: dtos };
    return this.http.post<IApiResponse<ITimesheetEntryResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.BATCH_ENTRIES}`, body);
  }

  getWeekEntries(weekStartDate: string): Observable<IApiResponse<IWeeklyTimesheetResponse>> {
    return this.http.get<IApiResponse<IWeeklyTimesheetResponse>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.WEEK(weekStartDate)}`);
  }

  updateEntry(entryId: string, updates: Partial<TimesheetEntry>): Observable<IApiResponse<ITimesheetEntryResponse>> {
    const body: IUpdateTimesheetEntryRequest = {};
    if (updates.projectId || updates.project) body.project = updates.projectId || updates.project || '';
    if (updates.task !== undefined) body.task = updates.task;
    if (updates.description !== undefined) body.description = updates.description;
    if (updates.hours !== undefined || updates.hoursWorked !== undefined) {
      body.hours = updates.hours || updates.hoursWorked || 0;
    }
    if (updates.isBillable !== undefined || updates.billable !== undefined) {
      body.isBillable = updates.isBillable !== undefined ? updates.isBillable : (updates.billable || false);
    }
    return this.http.put<IApiResponse<ITimesheetEntryResponse>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.ENTRY(entryId)}`, body);
  }

  deleteEntry(entryId: string): Observable<IApiResponse<null>> {
    return this.http.delete<IApiResponse<null>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.ENTRY(entryId)}`);
  }

  submitWeek(weekStartDate: string): Observable<IApiResponse<ITimesheetApprovalActionResponse>> {
    const body: ISubmitWeekRequest = { weekStartDate };
    return this.http.post<IApiResponse<ITimesheetApprovalActionResponse>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.SUBMIT}`, body);
  }

  getHistory(params?: { startDate?: string; endDate?: string; status?: string }): Observable<IApiResponse<ITimesheetHistoryResponse[]>> {
    const httpParams = buildHttpParams({
      ...params,
      status: params?.status?.toLowerCase()
    });
    return this.http.get<IApiResponse<ITimesheetHistoryResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.HISTORY}`, { params: httpParams });
  }

  getPendingApprovals(): Observable<IApiResponse<IPendingTimesheetGroupResponse[]>> {
    return this.http.get<IApiResponse<IPendingTimesheetGroupResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.PENDING_APPROVALS}`);
  }

  approveEntries(entryIds: string[], comments?: string): Observable<IApiResponse<ITimesheetApprovalActionResponse>> {
    const body: IApproveTimesheetEntriesRequest = { entryIds, comments };
    return this.http.post<IApiResponse<ITimesheetApprovalActionResponse>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.APPROVE}`, body);
  }

  rejectEntries(entryIds: string[], reason: string): Observable<IApiResponse<ITimesheetApprovalActionResponse>> {
    const body: IRejectTimesheetEntriesRequest = { entryIds, comments: reason };
    return this.http.post<IApiResponse<ITimesheetApprovalActionResponse>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.REJECT}`, body);
  }
}

