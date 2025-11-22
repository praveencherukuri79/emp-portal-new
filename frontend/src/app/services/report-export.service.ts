/**
 * Report Export Service
 * Handles exporting reports to PDF and Excel
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '@shared/types/constants';

export type ExportFormat = 'pdf' | 'excel';

@Injectable({
  providedIn: 'root'
})
export class ReportExportService {
  private http = inject(HttpClient);

  /**
   * Export timesheet report
   */
  exportTimesheetReport(
    format: ExportFormat,
    filters?: {
      userId?: string;
      startDate?: string;
      endDate?: string;
      project?: string;
      status?: string;
    }
  ): Observable<Blob> {
    const url = `${environment.apiUrl}${API_ENDPOINTS.REPORTS.TIMESHEET}/export`;
    return this.http.post(url, { format, ...filters }, {
      responseType: 'blob'
    });
  }

  /**
   * Export leave report
   */
  exportLeaveReport(
    format: ExportFormat,
    filters?: {
      userId?: string;
      startDate?: string;
      endDate?: string;
      leaveType?: string;
      status?: string;
    }
  ): Observable<Blob> {
    const url = `${environment.apiUrl}${API_ENDPOINTS.REPORTS.LEAVE}/export`;
    return this.http.post(url, { format, ...filters }, {
      responseType: 'blob'
    });
  }

  /**
   * Export team report
   */
  exportTeamReport(
    format: ExportFormat,
    filters?: {
      startDate?: string;
      endDate?: string;
      department?: string;
    }
  ): Observable<Blob> {
    const url = `${environment.apiUrl}${API_ENDPOINTS.REPORTS.TEAM}/export`;
    return this.http.post(url, { format, ...filters }, {
      responseType: 'blob'
    });
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get filename for export
   */
  getExportFilename(reportType: string, format: ExportFormat): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';
    return `${reportType}_report_${timestamp}.${extension}`;
  }
}


