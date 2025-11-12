import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IUpdateTenantRequest } from '@shared/types/requests';
import { IApiResponse } from '@shared/types';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  /**
   * Get tenant settings
   * GET /api/v1/settings/tenant
   */
  getTenantSettings(): Observable<IApiResponse<any>> {
    return this.http.get<IApiResponse<any>>(`${this.baseUrl}${API_ENDPOINTS.SETTINGS.GET_TENANT}`);
  }

  /**
   * Update tenant settings
   * PUT /api/v1/settings/tenant
   */
  updateTenantSettings(data: IUpdateTenantRequest): Observable<IApiResponse<any>> {
    return this.http.put<IApiResponse<any>>(`${this.baseUrl}${API_ENDPOINTS.SETTINGS.UPDATE_TENANT}`, data);
  }
}

