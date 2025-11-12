import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationType, NotificationPriority } from '@shared/types';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { INotificationResponse, INotificationsListResponse, IUnreadCountResponse } from '@shared/types/responses';

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

  getNotifications(params?: { isRead?: boolean; type?: NotificationType }): Observable<IApiResponse<INotificationsListResponse>> {
    let httpParams = new HttpParams();
    if (params?.isRead !== undefined) httpParams = httpParams.set('isRead', params.isRead.toString());
    if (params?.type) httpParams = httpParams.set('type', params.type);
    
    return this.http.get<IApiResponse<INotificationsListResponse>>(this.baseUrl, { params: httpParams }).pipe(
      tap((response) => {
        if (response.data?.unreadCount !== undefined) {
          this.unreadCount.set(response.data.unreadCount);
        }
      })
    );
  }

  getUnreadCount(): Observable<IApiResponse<IUnreadCountResponse>> {
    return this.http.get<IApiResponse<IUnreadCountResponse>>(`${environment.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT}`).pipe(
      tap((response) => {
        if (response.data?.count !== undefined) {
          this.unreadCount.set(response.data.count);
        }
      })
    );
  }

  markAsRead(notificationId: string): Observable<IApiResponse<INotificationResponse>> {
    return this.http.put<IApiResponse<INotificationResponse>>(`${environment.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId)}`, {}).pipe(
      tap(() => {
        this.unreadCount.update(count => Math.max(0, count - 1));
      })
    );
  }

  markAllAsRead(): Observable<IApiResponse<null>> {
    return this.http.put<IApiResponse<null>>(`${environment.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ}`, {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
      })
    );
  }

  deleteNotification(notificationId: string): Observable<IApiResponse<null>> {
    return this.http.delete<IApiResponse<null>>(`${environment.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId)}`);
  }

  initializeUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }
}
