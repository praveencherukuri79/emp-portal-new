import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ReportFormat = 'json' | 'pdf' | 'excel';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getTimesheetReport(params: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    format?: ReportFormat;
  }): Observable<any> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    if (params.format === 'pdf' || params.format === 'excel') {
      return this.http.get(`${this.apiUrl}/timesheet`, {
        params: httpParams,
        responseType: 'blob'
      });
    }

    return this.http.get(`${this.apiUrl}/timesheet`, { params: httpParams });
  }

  getLeaveReport(params: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    leaveType?: string;
    format?: ReportFormat;
  }): Observable<any> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    if (params.format === 'pdf' || params.format === 'excel') {
      return this.http.get(`${this.apiUrl}/leave`, {
        params: httpParams,
        responseType: 'blob'
      });
    }

    return this.http.get(`${this.apiUrl}/leave`, { params: httpParams });
  }

  getTeamReport(params?: {
    departmentId?: string;
    format?: ReportFormat;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    if (params?.format === 'pdf' || params?.format === 'excel') {
      return this.http.get(`${this.apiUrl}/team`, {
        params: httpParams,
        responseType: 'blob'
      });
    }

    return this.http.get(`${this.apiUrl}/team`, { params: httpParams });
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

