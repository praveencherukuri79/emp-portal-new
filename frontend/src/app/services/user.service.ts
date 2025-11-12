import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../core/models/user.model';
import { IUpdateProfileRequest, IUpdateEmployeeInfoRequest, ICreateUserRequest, IUpdateUserRoleRequest } from '@shared/types/requests';
import { API_ENDPOINTS } from '@shared/types/constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.USERS.ALL}`;

  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.USERS.PROFILE}`);
  }

  updateProfile(data: IUpdateProfileRequest): Observable<any> {
    return this.http.put(`${environment.apiUrl}${API_ENDPOINTS.USERS.PROFILE}`, data);
  }

  getAllUsers(params?: { role?: string; isActive?: boolean }): Observable<{ status: string; data: User[]; message?: string }> {
    let httpParams = new HttpParams();
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
    return this.http.get<{ status: string; data: User[]; message?: string }>(this.baseUrl, { params: httpParams });
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.USERS.BY_ID(userId)}`);
  }

  createUser(userData: ICreateUserRequest): Observable<any> {
    return this.http.post(this.baseUrl, userData);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    const body: IUpdateUserRoleRequest = { role: role as any };
    return this.http.put(`${environment.apiUrl}${API_ENDPOINTS.USERS.ROLE(userId)}`, body);
  }

  updateEmployeeInfo(userId: string, employeeInfo: IUpdateEmployeeInfoRequest): Observable<any> {
    return this.http.put(`${environment.apiUrl}${API_ENDPOINTS.USERS.EMPLOYEE_INFO(userId)}`, employeeInfo);
  }

  activateUser(userId: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}${API_ENDPOINTS.USERS.ACTIVATE(userId)}`, {});
  }

  deactivateUser(userId: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}${API_ENDPOINTS.USERS.DEACTIVATE(userId)}`, {});
  }

  getTeamMembers(): Observable<{ status: string; data: User[]; message?: string }> {
    return this.http.get<{ status: string; data: User[]; message?: string }>(`${environment.apiUrl}${API_ENDPOINTS.USERS.TEAM}`);
  }
}
