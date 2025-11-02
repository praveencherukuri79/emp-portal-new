import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  // Get role-based dashboard data
  getDashboard(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // The backend will automatically determine which dashboard to return
  // based on the user's role from the JWT token
}

