/**
 * Notification Mark-as-Read Controller Methods
 */

import { Response } from 'express';
import { Notification } from '../models';
import { ApiResponse, RequestValidator } from '../utils';
import { IAuthRequest } from '../types';
import { toNotificationResponse } from '../dto';

export class NotificationMarkAsReadController {
  /**
   * Mark notification as read
   * PATCH /api/v1/notifications/:id/read
   */
  static async markAsRead(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;
      if (!RequestValidator.validateUserContext(req, res)) return;

      const idValidation = RequestValidator.validateObjectId(req.params.id, 'Notification ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      const notification = await Notification.findOne({
        _id: req.params.id,
        tenantId: req.user!.tenantId,
        userId: req.user!.userId
      });

      if (!notification) {
        return ApiResponse.notFound(res, 'Notification not found');
      }

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      const responseData = toNotificationResponse(notification);
      return ApiResponse.success(res, responseData, 'Notification marked as read');
    } catch (error) {
      console.error('Mark as read error:', error);
      return ApiResponse.error(res, 'Failed to mark notification as read', 500);
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /api/v1/notifications/read-all
   */
  static async markAllAsRead(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;
      if (!RequestValidator.validateUserContext(req, res)) return;

      const result = await Notification.updateMany(
        {
          tenantId: req.user!.tenantId,
          userId: req.user!.userId,
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        }
      );

      return ApiResponse.success(
        res,
        { modifiedCount: result.modifiedCount },
        `${result.modifiedCount} notification(s) marked as read`
      );
    } catch (error) {
      console.error('Mark all as read error:', error);
      return ApiResponse.error(res, 'Failed to mark notifications as read', 500);
    }
  }
}

