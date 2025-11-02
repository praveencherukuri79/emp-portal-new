import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  employeeId?: string;
  isActive: boolean;
  employeeInfo?: {
    department?: string;
    jobTitle?: string;
    hireDate?: Date;
    salary?: number;
    bankDetails?: {
      accountNumber?: string;
      bankName?: string;
      ifscCode?: string;
    };
  };
  visaInfo?: {
    visaType?: string;
    visaNumber?: string;
    visaExpiry?: Date;
  };
  leaveBalance?: {
    annual?: number;
    sick?: number;
    personal?: number;
    unpaid?: number;
    maternity?: number;
    paternity?: number;
  };
}

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

  getAllUsers(params?: { role?: string; isActive?: boolean }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
    return this.http.get(this.apiUrl, { params: httpParams });
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

  getTeamMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/team`);
  }
}

