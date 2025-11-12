import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { ITimesheetReportResponse, ILeaveReportResponse, ITeamReportResponse } from '@shared/types/responses';

export type ReportFormat = 'json' | 'pdf' | 'excel';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.REPORTS.TIMESHEET}`;

  getTimesheetReport(params: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    format?: ReportFormat;
  }): Observable<IApiResponse<ITimesheetReportResponse> | Blob> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    if (params.format === 'pdf' || params.format === 'excel') {
      return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.REPORTS.TIMESHEET}`, {
        params: httpParams,
        responseType: 'blob'
      }) as Observable<Blob>;
    }

    return this.http.get<IApiResponse<ITimesheetReportResponse>>(`${environment.apiUrl}${API_ENDPOINTS.REPORTS.TIMESHEET}`, { params: httpParams });
  }

  getLeaveReport(params: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    leaveType?: string;
    format?: ReportFormat;
  }): Observable<IApiResponse<ILeaveReportResponse> | Blob> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    if (params.format === 'pdf' || params.format === 'excel') {
      return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.REPORTS.LEAVE}`, {
        params: httpParams,
        responseType: 'blob'
      }) as Observable<Blob>;
    }

    return this.http.get<IApiResponse<ILeaveReportResponse>>(`${environment.apiUrl}${API_ENDPOINTS.REPORTS.LEAVE}`, { params: httpParams });
  }

  getTeamReport(params?: {
    departmentId?: string;
    format?: ReportFormat;
  }): Observable<IApiResponse<ITeamReportResponse> | Blob> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    if (params?.format === 'pdf' || params?.format === 'excel') {
      return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.REPORTS.TEAM}`, {
        params: httpParams,
        responseType: 'blob'
      }) as Observable<Blob>;
    }

    return this.http.get<IApiResponse<ITeamReportResponse>>(`${environment.apiUrl}${API_ENDPOINTS.REPORTS.TEAM}`, { params: httpParams });
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
