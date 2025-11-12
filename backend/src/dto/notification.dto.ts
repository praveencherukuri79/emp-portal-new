import {
  INotificationResponse,
  INotificationsListResponse,
  IUnreadCountResponse
} from '@shared/types/responses';
import Notification from '../models/notification.model';
import { INotification } from '../types';
import { Document } from 'mongoose';

/**
 * Convert Notification model to INotificationResponse
 */
export function toNotificationResponse(notif: Document & INotification): INotificationResponse {
  return {
    _id: String(notif._id),
    userId: String(notif.userId),
    type: notif.type,
    title: notif.title,
    message: notif.message,
    isRead: notif.isRead,
    priority: notif.priority,
    actionUrl: notif.actionUrl,
    relatedEntity: notif.relatedEntity,
    createdAt: notif.createdAt,
    readAt: notif.readAt
  };
}

/**
 * Convert array of Notification models to INotificationsListResponse
 */
export function toNotificationsListResponse(
  notifications: (Document & INotification)[],
  unreadCount: number
): INotificationsListResponse {
  return {
    notifications: notifications.map(toNotificationResponse),
    unreadCount
  };
}

/**
 * Convert count to IUnreadCountResponse
 */
export function toUnreadCountResponse(count: number): IUnreadCountResponse {
  return { count };
}

