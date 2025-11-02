import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TimesheetEntry {
  _id?: string;
  date: Date | string;
  projectId: string;
  hoursWorked: number;
  description: string;
  isBillable: boolean;
  status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
}

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/timesheets`;

  createEntry(entry: TimesheetEntry): Observable<any> {
    return this.http.post(`${this.apiUrl}/entries`, entry);
  }

  batchCreateEntries(entries: TimesheetEntry[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/entries/batch`, { entries });
  }

  getWeekEntries(weekStartDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/week/${weekStartDate}`);
  }

  updateEntry(entryId: string, updates: Partial<TimesheetEntry>): Observable<any> {
    return this.http.put(`${this.apiUrl}/entries/${entryId}`, updates);
  }

  deleteEntry(entryId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/entries/${entryId}`);
  }

  submitWeek(weekStartDate: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, { weekStartDate });
  }

  getHistory(params?: { startDate?: string; endDate?: string; status?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get(`${this.apiUrl}/history`, { params: httpParams });
  }

  getPendingApprovals(): Observable<any> {
    return this.http.get(`${this.apiUrl}/approvals/pending`);
  }

  approveEntries(entryIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/approvals/approve`, { entryIds });
  }

  rejectEntries(entryIds: string[], reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/approvals/reject`, { entryIds, reason });
  }
}

