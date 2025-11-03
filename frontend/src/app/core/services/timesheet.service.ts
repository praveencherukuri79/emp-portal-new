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
   * Get current week date range (Mon-Sun)
   */
  getCurrentWeekRange(): { start: Date; end: Date } {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
  }

  /**
   * Get previous week range
   */
  getPreviousWeek(currentStart: Date): { start: Date; end: Date } {
    const start = new Date(currentStart);
    start.setDate(start.getDate() - 7);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  /**
   * Get next week range
   */
  getNextWeek(currentStart: Date): { start: Date; end: Date } {
    const start = new Date(currentStart);
    start.setDate(start.getDate() + 7);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
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
}
