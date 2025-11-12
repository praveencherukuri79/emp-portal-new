import { Response } from 'express';
import Notification from '../models/notification.model';
import { ApiResponse } from '../utils/response.util';
import { IAuthRequest, NotificationPriority } from '../types';
import { ICreateNotificationRequest } from '@shared/types/requests';
import { toNotificationResponse, toNotificationsListResponse, toUnreadCountResponse } from '../dto';

export class NotificationController {
  /**
   * Create notification
   */
  static async createNotification(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const {
        userId,
        type,
        title,
        message,
        relatedEntity,
        actionUrl,
        priority,
        sendEmail
      }: ICreateNotificationRequest = req.body;

      const notification = new Notification({
        tenantId: req.user?.tenantId,
        userId,
        type,
        title,
        message,
        relatedEntity,
        actionUrl,
        priority: priority || NotificationPriority.MEDIUM
      });

      await notification.save();

      // Send email if requested
      if (sendEmail) {
        // Email sending will be handled by EmailUtil
        notification.emailSent = true;
        notification.emailSentAt = new Date();
        await notification.save();
      }

      const responseData = toNotificationResponse(notification);
      return ApiResponse.created(res, responseData, 'Notification created successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to create notification');
    }
  }

  /**
   * Get my notifications
   */
  static async getMyNotifications(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { isRead, type } = req.query as any;

      const query: any = {
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      };

      if (isRead !== undefined) query.isRead = isRead === 'true';
      if (type) query.type = type;

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        isRead: false
      });

      const responseData = toNotificationsListResponse(notifications, unreadCount);
      return ApiResponse.success(res, responseData, 'Notifications retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve notifications');
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { notificationId } = req.params;

      const notification = await Notification.findOne({
        _id: notificationId,
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      });

      if (!notification) {
        return ApiResponse.notFound(res, 'Notification not found');
        return;
      }

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      return ApiResponse.success(res, notification, 'Notification marked as read');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to mark notification as read');
    }
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      await Notification.updateMany(
        {
          tenantId: req.user?.tenantId,
          userId: req.user?.userId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      return ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to mark all notifications as read');
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { notificationId } = req.params;

      const result = await Notification.deleteOne({
        _id: notificationId,
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      });

      if (result.deletedCount === 0) {
        return ApiResponse.notFound(res, 'Notification not found');
        return;
      }

      return ApiResponse.success(res, null, 'Notification deleted successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to delete notification');
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const count = await Notification.countDocuments({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        isRead: false
      });

      const responseData = toUnreadCountResponse(count);
      return ApiResponse.success(res, responseData, 'Unread count retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve unread count');
    }
  }

  /**
   * Helper method to create and send notifications
   */
  static async sendNotification(
    tenantId: string,
    userId: string,
    type: string,
    title: string,
    message: string,
    options?: {
      relatedEntity?: any;
      actionUrl?: string;
      priority?: string;
      sendEmail?: boolean;
    }
  ): Promise<void> {
    try {
      const notification = new Notification({
        tenantId,
        userId,
        type,
        title,
        message,
        relatedEntity: options?.relatedEntity,
        actionUrl: options?.actionUrl,
        priority: options?.priority || NotificationPriority.MEDIUM
      });

      await notification.save();

      if (options?.sendEmail) {
        notification.emailSent = true;
        notification.emailSentAt = new Date();
        await notification.save();
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}






