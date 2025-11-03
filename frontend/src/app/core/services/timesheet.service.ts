import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TimesheetEntry,
  WeeklyTimesheet,
  Project,
  CreateTimesheetRequest,
  UpdateTimesheetRequest,
  SubmitWeekRequest
} from '../models/timesheet.model';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private readonly API_URL = `${environment.apiUrl}/timesheets`;
  private readonly PROJECT_URL = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  /**
   * Get all projects for dropdown
   */
  getProjects(): Observable<{ data: Project[] }> {
    return this.http.get<{ data: Project[] }>(this.PROJECT_URL);
  }

  /**
   * Get timesheet entries for a specific week
   */
  getWeeklyEntries(weekStart: string, weekEnd: string): Observable<{ data: WeeklyTimesheet }> {
    return this.http.get<{ data: WeeklyTimesheet }>(
      `${this.API_URL}/week/${weekStart}`
    );
  }

  /**
   * Create a new timesheet entry
   */
  createEntry(entry: CreateTimesheetRequest): Observable<{ data: TimesheetEntry }> {
    return this.http.post<{ data: TimesheetEntry }>(`${this.API_URL}/entries`, entry);
  }

  /**
   * Batch create multiple timesheet entries
   */
  batchCreateEntries(entries: CreateTimesheetRequest[]): Observable<{ data: TimesheetEntry[] }> {
    return this.http.post<{ data: TimesheetEntry[] }>(`${this.API_URL}/entries/batch`, { entries });
  }

  /**
   * Update an existing timesheet entry (only if Draft or Rejected)
   */
  updateEntry(entry: UpdateTimesheetRequest): Observable<{ data: TimesheetEntry }> {
    return this.http.put<{ data: TimesheetEntry }>(`${this.API_URL}/entries/${entry._id}`, entry);
  }

  /**
   * Delete a timesheet entry (only if Draft or Rejected)
   */
  deleteEntry(entryId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/entries/${entryId}`);
  }

  /**
   * Submit entire week for approval
   */
  submitWeek(data: SubmitWeekRequest): Observable<{ data: WeeklyTimesheet }> {
    return this.http.post<{ data: WeeklyTimesheet }>(`${this.API_URL}/submit`, data);
  }

  /**
   * Get timesheet history with optional filters
   */
  getHistory(params?: { startDate?: string; endDate?: string; status?: string }): Observable<{ data: TimesheetEntry[] }> {
    let queryParams = '';
    if (params) {
      const queryArray: string[] = [];
      if (params.startDate) queryArray.push(`startDate=${params.startDate}`);
      if (params.endDate) queryArray.push(`endDate=${params.endDate}`);
      if (params.status) queryArray.push(`status=${params.status}`);
      if (queryArray.length > 0) {
        queryParams = '?' + queryArray.join('&');
      }
    }
    return this.http.get<{ data: TimesheetEntry[] }>(`${this.API_URL}/history${queryParams}`);
  }

  /**
   * Get current week date range (Mon-Sun)
   */
  getCurrentWeekRange(): { start: Date; end: Date } {
    const today = dayjs();
    const monday = today.startOf('isoWeek');
    const sunday = monday.add(6, 'days').endOf('day');

    return { 
      start: monday.toDate(), 
      end: sunday.toDate() 
    };
  }

  /**
   * Get previous week range
   */
  getPreviousWeek(currentStart: Date): { start: Date; end: Date } {
    const start = dayjs(currentStart).subtract(7, 'days');
    const end = start.add(6, 'days').endOf('day');

    return { 
      start: start.toDate(), 
      end: end.toDate() 
    };
  }

  /**
   * Get next week range
   */
  getNextWeek(currentStart: Date): { start: Date; end: Date } {
    const start = dayjs(currentStart).add(7, 'days');
    const end = start.add(6, 'days').endOf('day');

    return { 
      start: start.toDate(), 
      end: end.toDate() 
    };
  }

  /**
   * Format date to YYYY-MM-DD for API
   */
  formatDate(date: Date): string {
    return dayjs(date).format('YYYY-MM-DD');
  }
}
