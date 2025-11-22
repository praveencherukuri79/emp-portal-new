import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { 
  IProspectDashboardResponse, 
  IEmployeeDashboardResponse, 
  ISupervisorDashboardResponse, 
  IHRDashboardResponse, 
  IAdminDashboardResponse, 
  IEmployerDashboardResponse 
} from '@shared/types/responses';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${API_ENDPOINTS.DASHBOARD.BASE}`;

  getDashboard(): Observable<IApiResponse<IProspectDashboardResponse | IEmployeeDashboardResponse | ISupervisorDashboardResponse | IHRDashboardResponse | IAdminDashboardResponse | IEmployerDashboardResponse>> {
    return this.http.get<IApiResponse<IProspectDashboardResponse | IEmployeeDashboardResponse | ISupervisorDashboardResponse | IHRDashboardResponse | IAdminDashboardResponse | IEmployerDashboardResponse>>(this.apiUrl);
  }
}

