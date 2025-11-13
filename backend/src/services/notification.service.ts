/**
 * Notification Service
 * Business logic for notification management
 */

import { Notification, User } from '../models';
import { NotificationType, NotificationPriority } from '@shared/types';
import { EmailUtil } from '../utils';

interface INotificationData {
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  sendEmail?: boolean;
  relatedEntity?: {
    entityType: 'timesheet' | 'leave' | 'document' | 'user';
    entityId: string;
  };
}

export class NotificationService {
  /**
   * Create notification
   */
  static async createNotification(data: INotificationData) {
    const notification = new Notification({
      tenantId: data.tenantId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || NotificationPriority.MEDIUM,
      actionUrl: data.actionUrl,
      relatedEntity: data.relatedEntity,
      isRead: false,
      emailSent: false
    });

    await notification.save();

    // Send email if requested
    if (data.sendEmail) {
      await this.sendEmailNotification(notification._id as string);
    }

    return notification;
  }

  /**
   * Send email for notification
   */
  static async sendEmailNotification(notificationId: string) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification || notification.emailSent) {
        return;
      }

      const user = await User.findById(notification.userId);
      if (!user) {
        return;
      }

      // Send email using EmailUtil
      try {
        await EmailUtil.send({
          to: user.email,
          subject: notification.title,
          html: `
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            ${notification.actionUrl ? `<p><a href="${notification.actionUrl}">View Details</a></p>` : ''}
          `
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue even if email fails
      }

      notification.emailSent = true;
      notification.emailSentAt = new Date();
      await notification.save();
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Create timesheet approval notification
   */
  static async notifyTimesheetApproved(
    tenantId: string,
    userId: string,
    weekStart: string,
    weekEnd: string,
    approverName: string
  ) {
    return await this.createNotification({
      tenantId,
      userId,
      type: NotificationType.TIMESHEET_APPROVED,
      title: 'Timesheet Approved',
      message: `Your timesheet for week ${weekStart} to ${weekEnd} has been approved by ${approverName}`,
      priority: NotificationPriority.MEDIUM,
      actionUrl: '/employee/timesheets',
      sendEmail: true
    });
  }

  /**
   * Create timesheet rejection notification
   */
  static async notifyTimesheetRejected(
    tenantId: string,
    userId: string,
    weekStart: string,
    weekEnd: string,
    approverName: string,
    reason?: string
  ) {
    const message = reason 
      ? `Your timesheet for week ${weekStart} to ${weekEnd} has been rejected by ${approverName}. Reason: ${reason}`
      : `Your timesheet for week ${weekStart} to ${weekEnd} has been rejected by ${approverName}`;

    return await this.createNotification({
      tenantId,
      userId,
      type: NotificationType.TIMESHEET_REJECTED,
      title: 'Timesheet Rejected',
      message,
      priority: NotificationPriority.HIGH,
      actionUrl: '/employee/timesheets',
      sendEmail: true
    });
  }

  /**
   * Create leave approval notification
   */
  static async notifyLeaveApproved(
    tenantId: string,
    userId: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    approverName: string
  ) {
    return await this.createNotification({
      tenantId,
      userId,
      type: NotificationType.LEAVE_APPROVED,
      title: 'Leave Request Approved',
      message: `Your ${leaveType} leave from ${startDate} to ${endDate} has been approved by ${approverName}`,
      priority: NotificationPriority.HIGH,
      actionUrl: '/employee/leaves',
      sendEmail: true
    });
  }

  /**
   * Create leave rejection notification
   */
  static async notifyLeaveRejected(
    tenantId: string,
    userId: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    approverName: string,
    reason?: string
  ) {
    const message = reason
      ? `Your ${leaveType} leave from ${startDate} to ${endDate} has been rejected by ${approverName}. Reason: ${reason}`
      : `Your ${leaveType} leave from ${startDate} to ${endDate} has been rejected by ${approverName}`;

    return await this.createNotification({
      tenantId,
      userId,
      type: NotificationType.LEAVE_REJECTED,
      title: 'Leave Request Rejected',
      message,
      priority: NotificationPriority.HIGH,
      actionUrl: '/employee/leaves',
      sendEmail: true
    });
  }

  /**
   * Create document expiring notification
   */
  static async notifyDocumentExpiring(
    tenantId: string,
    userId: string,
    documentName: string,
    expiryDate: string,
    daysUntilExpiry: number
  ) {
    return await this.createNotification({
      tenantId,
      userId,
      type: NotificationType.DOCUMENT_EXPIRING,
      title: 'Document Expiring Soon',
      message: `Your document "${documentName}" will expire in ${daysUntilExpiry} days (${expiryDate})`,
      priority: daysUntilExpiry <= 7 ? NotificationPriority.URGENT : NotificationPriority.HIGH,
      actionUrl: '/employee/documents',
      sendEmail: true
    });
  }

  /**
   * Create document shared notification
   */
  static async notifyDocumentShared(
    tenantId: string,
    userId: string,
    documentName: string,
    sharedByName: string,
    documentId: string
  ) {
    return await this.createNotification({
      tenantId,
      userId,
      type: NotificationType.DOCUMENT_SHARED,
      title: 'Document Shared With You',
      message: `${sharedByName} shared "${documentName}" with you`,
      priority: NotificationPriority.MEDIUM,
      actionUrl: '/employee/documents',
      sendEmail: false
    });
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    tenantId: string,
    userId: string,
    limit: number = 50
  ) {
    return await Notification.find({ tenantId, userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(tenantId: string, userId: string) {
    return await Notification.countDocuments({
      tenantId,
      userId,
      isRead: false
    });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification || notification.isRead) {
      return notification;
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(tenantId: string, userId: string) {
    const result = await Notification.updateMany(
      { tenantId, userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return result.modifiedCount;
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    return await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });
  }
}

export default NotificationService;
