import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IApiResponse,
  IEmployerAnalyticsOverview,
  IEmployerFinancialOverview,
  IEmployerWorkforceOverview
} from '@shared/types';
import { API_ENDPOINTS } from '@shared/types/constants';
import { environment } from '../../environments/environment';
import { buildHttpParams } from '../shared/utils/http.util';

type FinancialPeriod = 'month' | 'quarter' | 'year';

@Injectable({
  providedIn: 'root'
})
export class EmployerService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getWorkforceOverview(): Observable<IApiResponse<IEmployerWorkforceOverview>> {
    return this.http.get<IApiResponse<IEmployerWorkforceOverview>>(
      `${this.apiUrl}${API_ENDPOINTS.EMPLOYER.WORKFORCE}`
    );
  }

  getFinancialOverview(period: FinancialPeriod): Observable<IApiResponse<IEmployerFinancialOverview>> {
    const params = buildHttpParams({ period });

    return this.http.get<IApiResponse<IEmployerFinancialOverview>>(
      `${this.apiUrl}${API_ENDPOINTS.EMPLOYER.FINANCIAL}`,
      { params }
    );
  }

  getBusinessAnalytics(): Observable<IApiResponse<IEmployerAnalyticsOverview>> {
    return this.http.get<IApiResponse<IEmployerAnalyticsOverview>>(
      `${this.apiUrl}${API_ENDPOINTS.EMPLOYER.ANALYTICS}`
    );
  }
}

