import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../core/models/user.model';
import { IUpdateProfileRequest, IUpdateEmployeeInfoRequest, ICreateUserRequest, IUpdateUserRoleRequest } from '@shared/types/requests';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { IUserResponse, IUsersListResponse } from '@shared/types/responses';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.USERS.ALL}`;

  getProfile(): Observable<IApiResponse<IUserResponse>> {
    return this.http.get<IApiResponse<IUserResponse>>(`${environment.apiUrl}${API_ENDPOINTS.USERS.PROFILE}`);
  }

  updateProfile(data: IUpdateProfileRequest): Observable<IApiResponse<IUserResponse>> {
    return this.http.put<IApiResponse<IUserResponse>>(`${environment.apiUrl}${API_ENDPOINTS.USERS.PROFILE}`, data);
  }

  updateUserById(userId: string, data: IUpdateProfileRequest): Observable<IApiResponse<IUserResponse>> {
    return this.http.put<IApiResponse<IUserResponse>>(`${environment.apiUrl}${API_ENDPOINTS.USERS.BY_ID(userId)}`, data);
  }

  getAllUsers(params?: { role?: string; isActive?: boolean }): Observable<IApiResponse<IUsersListResponse>> {
    let httpParams = new HttpParams();
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
    return this.http.get<IApiResponse<IUsersListResponse>>(this.baseUrl, { params: httpParams });
  }

  getUserById(userId: string): Observable<IApiResponse<IUserResponse>> {
    return this.http.get<IApiResponse<IUserResponse>>(`${environment.apiUrl}${API_ENDPOINTS.USERS.BY_ID(userId)}`);
  }

  createUser(userData: ICreateUserRequest): Observable<IApiResponse<IUserResponse>> {
    return this.http.post<IApiResponse<IUserResponse>>(this.baseUrl, userData);
  }

  updateUserRole(userId: string, role: string): Observable<IApiResponse<IUserResponse>> {
    const body: IUpdateUserRoleRequest = { role: role as any };
    return this.http.put<IApiResponse<IUserResponse>>(`${environment.apiUrl}${API_ENDPOINTS.USERS.ROLE(userId)}`, body);
  }

  updateEmployeeInfo(userId: string, employeeInfo: IUpdateEmployeeInfoRequest): Observable<IApiResponse<IUserResponse>> {
    return this.http.put<IApiResponse<IUserResponse>>(`${environment.apiUrl}${API_ENDPOINTS.USERS.EMPLOYEE_INFO(userId)}`, employeeInfo);
  }

  activateUser(userId: string): Observable<IApiResponse<IUserResponse>> {
    return this.http.put<IApiResponse<IUserResponse>>(`${environment.apiUrl}${API_ENDPOINTS.USERS.ACTIVATE(userId)}`, {});
  }

  deactivateUser(userId: string): Observable<IApiResponse<IUserResponse>> {
    return this.http.put<IApiResponse<IUserResponse>>(`${environment.apiUrl}${API_ENDPOINTS.USERS.DEACTIVATE(userId)}`, {});
  }

  getTeamMembers(): Observable<IApiResponse<IUserResponse[]>> {
    return this.http.get<IApiResponse<IUserResponse[]>>(`${environment.apiUrl}${API_ENDPOINTS.USERS.TEAM}`);
  }
}
