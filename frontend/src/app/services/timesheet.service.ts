import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TimesheetStatus, ITimesheetEntryDTO } from '@shared/types';
import { IBatchTimesheetEntriesRequest, IUpdateTimesheetEntryRequest, ISubmitWeekRequest, IApproveTimesheetEntriesRequest, IRejectTimesheetEntriesRequest } from '@shared/types/requests';
import { API_ENDPOINTS } from '@shared/types/constants';

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

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.ENTRIES}`;

  createEntry(entry: TimesheetEntry): Observable<any> {
    const dto: ITimesheetEntryDTO = {
      date: entry.date,
      project: entry.projectId || entry.project || '',
      task: entry.task,
      description: entry.description,
      hours: entry.hours || entry.hoursWorked || 0,
      isBillable: entry.isBillable !== undefined ? entry.isBillable : (entry.billable !== undefined ? entry.billable : true)
    };
    return this.http.post(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.ENTRIES}`, dto);
  }

  batchCreateEntries(entries: TimesheetEntry[]): Observable<any> {
    const dtos = entries.map(entry => ({
      date: entry.date,
      project: entry.projectId || entry.project || '',
      task: entry.task,
      description: entry.description,
      hours: entry.hours || entry.hoursWorked || 0,
      isBillable: entry.isBillable !== undefined ? entry.isBillable : (entry.billable !== undefined ? entry.billable : true)
    }));
    const body: IBatchTimesheetEntriesRequest = { entries: dtos };
    return this.http.post(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.BATCH_ENTRIES}`, body);
  }

  getWeekEntries(weekStartDate: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.WEEK(weekStartDate)}`);
  }

  updateEntry(entryId: string, updates: Partial<TimesheetEntry>): Observable<any> {
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
    return this.http.put(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.ENTRY(entryId)}`, body);
  }

  deleteEntry(entryId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.ENTRY(entryId)}`);
  }

  submitWeek(weekStartDate: string): Observable<any> {
    const body: ISubmitWeekRequest = { weekStartDate };
    return this.http.post(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.SUBMIT}`, body);
  }

  getHistory(params?: { startDate?: string; endDate?: string; status?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params?.status) httpParams = httpParams.set('status', params.status.toLowerCase());
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.HISTORY}`, { params: httpParams });
  }

  getPendingApprovals(): Observable<any> {
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.PENDING_APPROVALS}`);
  }

  approveEntries(entryIds: string[], comments?: string): Observable<any> {
    const body: IApproveTimesheetEntriesRequest = { entryIds, comments };
    return this.http.post(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.APPROVE}`, body);
  }

  rejectEntries(entryIds: string[], reason: string): Observable<any> {
    const body: IRejectTimesheetEntriesRequest = { entryIds, comments: reason };
    return this.http.post(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.REJECT}`, body);
  }
}
