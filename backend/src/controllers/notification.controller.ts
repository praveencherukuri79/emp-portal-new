import { Response } from 'express';
import Notification from '../models/notification.model';
import { ApiResponse, RequestValidator } from '../utils';
import { IAuthRequest, NotificationPriority } from '../types';
import { ICreateNotificationRequest } from '@shared/types/requests';
import { toNotificationResponse, toNotificationsListResponse, toUnreadCountResponse } from '../dto';
import NotificationService from '../services/notification.service';

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
      // Validate context
      if (!RequestValidator.validateTenantContext(req, res)) return;
      if (!RequestValidator.validateUserContext(req, res)) return;

      const { isRead, type } = req.query as any;

      const query: any = {
        tenantId: req.user!.tenantId,
        userId: req.user!.userId
      };

      if (isRead !== undefined) query.isRead = isRead === 'true';
      if (type) query.type = type;

      const notifications = await NotificationService.getUserNotifications(
        req.user!.tenantId,
        req.user!.userId,
        50
      );

      const unreadCount = await NotificationService.getUnreadCount(
        req.user!.tenantId,
        req.user!.userId
      );

      const responseData = toNotificationsListResponse(notifications, unreadCount);
      return ApiResponse.success(res, responseData, 'Notifications retrieved successfully');
    } catch (error) {
      console.error('Get notifications error:', error);
      return ApiResponse.error(res, 'Failed to retrieve notifications', 500);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { notificationId } = req.params;

      // Validate context and ID
      if (!RequestValidator.validateUserContext(req, res)) return;
      
      const idValidation = RequestValidator.validateObjectId(notificationId, 'Notification ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      const notification = await NotificationService.markAsRead(notificationId, req.user!.userId);

      if (!notification) {
        return ApiResponse.notFound(res, 'Notification not found');
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
      // Validate context
      if (!RequestValidator.validateTenantContext(req, res)) return;
      if (!RequestValidator.validateUserContext(req, res)) return;

      const count = await NotificationService.markAllAsRead(
        req.user!.tenantId,
        req.user!.userId
      );

      return ApiResponse.success(res, { count }, `${count} notifications marked as read`);
    } catch (error) {
      console.error('Mark all as read error:', error);
      return ApiResponse.error(res, 'Failed to mark all notifications as read', 500);
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { notificationId } = req.params;

      // Validate ID
      const idValidation = RequestValidator.validateObjectId(notificationId, 'Notification ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      const notification = await NotificationService.deleteNotification(
        notificationId,
        req.user!.userId
      );

      if (!notification) {
        return ApiResponse.notFound(res, 'Notification not found');
      }

      return ApiResponse.success(res, null, 'Notification deleted successfully');
    } catch (error) {
      console.error('Delete notification error:', error);
      return ApiResponse.error(res, 'Failed to delete notification', 500);
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      // Validate context
      if (!RequestValidator.validateTenantContext(req, res)) return;
      if (!RequestValidator.validateUserContext(req, res)) return;

      const count = await NotificationService.getUnreadCount(
        req.user!.tenantId,
        req.user!.userId
      );

      const responseData = toUnreadCountResponse(count);
      return ApiResponse.success(res, responseData, 'Unread count retrieved successfully');
    } catch (error) {
      console.error('Get unread count error:', error);
      return ApiResponse.error(res, 'Failed to retrieve unread count', 500);
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






