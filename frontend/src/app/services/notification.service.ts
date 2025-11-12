import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationType, NotificationPriority } from '@shared/types';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
  actionUrl?: string;
  priority?: NotificationPriority;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.ALL}`;
  
  unreadCount = signal<number>(0);

  getNotifications(params?: { isRead?: boolean; type?: NotificationType }): Observable<IApiResponse<Notification[]>> {
    let httpParams = new HttpParams();
    if (params?.isRead !== undefined) httpParams = httpParams.set('isRead', params.isRead.toString());
    if (params?.type) httpParams = httpParams.set('type', params.type);
    
    return this.http.get<IApiResponse<Notification[]>>(this.baseUrl, { params: httpParams }).pipe(
      tap((response) => {
        if (response.data && Array.isArray(response.data)) {
          const unread = response.data.filter(n => !n.isRead).length;
          this.unreadCount.set(unread);
        }
      })
    );
  }

  getUnreadCount(): Observable<IApiResponse<{ count: number }>> {
    return this.http.get<IApiResponse<{ count: number }>>(`${environment.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT}`).pipe(
      tap((response) => {
        if (response.data?.count !== undefined) {
          this.unreadCount.set(response.data.count);
        }
      })
    );
  }

  markAsRead(notificationId: string): Observable<IApiResponse<void>> {
    return this.http.put<IApiResponse<void>>(`${environment.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId)}`, {}).pipe(
      tap(() => {
        this.unreadCount.update(count => Math.max(0, count - 1));
      })
    );
  }

  markAllAsRead(): Observable<IApiResponse<void>> {
    return this.http.put<IApiResponse<void>>(`${environment.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ}`, {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
      })
    );
  }

  deleteNotification(notificationId: string): Observable<IApiResponse<void>> {
    return this.http.delete<IApiResponse<void>>(`${environment.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId)}`);
  }

  initializeUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }
}
