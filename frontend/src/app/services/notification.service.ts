import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
  actionUrl?: string;
  priority?: 'Low' | 'Medium' | 'High';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  // Signal for unread count
  unreadCount = signal<number>(0);

  getNotifications(params?: { isRead?: boolean; type?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.isRead !== undefined) httpParams = httpParams.set('isRead', params.isRead.toString());
    if (params?.type) httpParams = httpParams.set('type', params.type);
    
    return this.http.get(this.apiUrl, { params: httpParams }).pipe(
      tap((response: any) => {
        if (response.data?.unreadCount !== undefined) {
          this.unreadCount.set(response.data.unreadCount);
        }
      })
    );
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread-count`).pipe(
      tap((response: any) => {
        if (response.data?.count !== undefined) {
          this.unreadCount.set(response.data.count);
        }
      })
    );
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Decrement unread count
        this.unreadCount.update(count => Math.max(0, count - 1));
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
      })
    );
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`);
  }

  // Initialize unread count on app start
  initializeUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }
}

