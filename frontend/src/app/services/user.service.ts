import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  getAllUsers(params?: { role?: string; isActive?: boolean }): Observable<{ status: string; data: User[]; message?: string }> {
    let httpParams = new HttpParams();
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
    return this.http.get<{ status: string; data: User[]; message?: string }>(this.apiUrl, { params: httpParams });
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

  createUser(userData: Partial<User>): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/role`, { role });
  }

  updateEmployeeInfo(userId: string, employeeInfo: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/employee-info`, employeeInfo);
  }

  activateUser(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/activate`, {});
  }

  deactivateUser(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/deactivate`, {});
  }

  getTeamMembers(): Observable<{ status: string; data: User[]; message?: string }> {
    return this.http.get<{ status: string; data: User[]; message?: string }>(`${this.apiUrl}/team`);
  }
}

