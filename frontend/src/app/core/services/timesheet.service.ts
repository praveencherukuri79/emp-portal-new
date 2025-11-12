import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TimesheetStatus, ITimesheetEntryDTO } from '@shared/types';
import { IBatchTimesheetEntriesRequest, IUpdateTimesheetEntryRequest, ISubmitWeekRequest, IApproveTimesheetEntriesRequest, IRejectTimesheetEntriesRequest } from '@shared/types/requests';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { ITimesheetEntryResponse, IWeeklyTimesheetResponse, ITimesheetHistoryResponse, IPendingTimesheetGroupResponse, ITimesheetApprovalActionResponse, IProjectResponse } from '@shared/types/responses';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export interface TimesheetEntry extends ITimesheetEntryDTO {
  _id?: string;
  projectId?: string;
  project: string; // Required from ITimesheetEntryDTO
  hours: number; // Required from ITimesheetEntryDTO
  hoursWorked?: number;
  task?: string;
  description?: string;
  isBillable?: boolean;
  billable?: boolean;
  status?: TimesheetStatus;
}

export interface WeeklyTimesheet {
  weekStart: Date | string;
  weekEnd: Date | string;
  entries: TimesheetEntry[];
  totalHours: number;
  billableHours: number;
  status: TimesheetStatus;
  submittedAt?: Date | string;
}

export interface Project {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.ENTRIES}`;

  getProjects(): Observable<IApiResponse<IProjectResponse[]>> {
    return this.http.get<IApiResponse<IProjectResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.PROJECTS.ALL}`);
  }

  getWeeklyEntries(weekStart: string): Observable<IApiResponse<IWeeklyTimesheetResponse>> {
    return this.http.get<IApiResponse<IWeeklyTimesheetResponse>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.WEEK(weekStart)}`);
  }

  createEntry(entry: TimesheetEntry): Observable<IApiResponse<ITimesheetEntryResponse>> {
    const dto: ITimesheetEntryDTO = {
      date: entry.date,
      project: entry.projectId || entry.project || '',
      task: entry.task,
      description: entry.description,
      hours: entry.hours || entry.hoursWorked || 0,
      isBillable: entry.isBillable !== undefined ? entry.isBillable : (entry.billable !== undefined ? entry.billable : true)
    };
    return this.http.post<IApiResponse<ITimesheetEntryResponse>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.ENTRIES}`, dto);
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
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params?.status) httpParams = httpParams.set('status', params.status.toLowerCase());
    return this.http.get<IApiResponse<ITimesheetHistoryResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.HISTORY}`, { params: httpParams });
  }

  getPendingTimesheets(): Observable<IApiResponse<IPendingTimesheetGroupResponse[]>> {
    return this.http.get<IApiResponse<IPendingTimesheetGroupResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.PENDING_APPROVALS}`);
  }

  approveTimesheet(entryIds: string[], comments?: string): Observable<IApiResponse<ITimesheetApprovalActionResponse>> {
    const body: IApproveTimesheetEntriesRequest = { entryIds, comments };
    return this.http.post<IApiResponse<ITimesheetApprovalActionResponse>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.APPROVE}`, body);
  }

  rejectTimesheet(entryIds: string[], reason: string): Observable<IApiResponse<ITimesheetApprovalActionResponse>> {
    const body: IRejectTimesheetEntriesRequest = { entryIds, comments: reason };
    return this.http.post<IApiResponse<ITimesheetApprovalActionResponse>>(`${environment.apiUrl}${API_ENDPOINTS.TIMESHEETS.REJECT}`, body);
  }

  getCurrentWeekRange(): { start: Date; end: Date } {
    const today = dayjs();
    const monday = today.startOf('isoWeek');
    const sunday = monday.add(6, 'days').endOf('day');
    return { start: monday.toDate(), end: sunday.toDate() };
  }

  getPreviousWeek(currentStart: Date): { start: Date; end: Date } {
    const start = dayjs(currentStart).subtract(7, 'days');
    const end = start.add(6, 'days').endOf('day');
    return { start: start.toDate(), end: end.toDate() };
  }

  getNextWeek(currentStart: Date): { start: Date; end: Date } {
    const start = dayjs(currentStart).add(7, 'days');
    const end = start.add(6, 'days').endOf('day');
    return { start: start.toDate(), end: end.toDate() };
  }

  formatDate(date: Date): string {
    return dayjs(date).format('YYYY-MM-DD');
  }
}
