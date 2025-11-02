import { Model } from 'mongoose';
import { INotification } from '../types';
import { BaseService } from './base.service';
import { QueryBuilder } from '../utils/query-builder.util';

export class NotificationService extends BaseService<INotification> {
  constructor(model: Model<INotification>) {
    super(model);
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    tenantId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
    unreadOnly: boolean = false
  ) {
    const query = new QueryBuilder<INotification>(this.model)
      .withTenant(tenantId)
      .withUser(userId)
      .paginate(page, limit)
      .sortBy('-createdAt');

    if (unreadOnly) {
      query.withFilter({ isRead: false });
    }

    return query.execute();
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    return this.model.countDocuments({
      tenantId,
      userId,
      isRead: false,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, tenantId: string, userId: string) {
    return this.model.findOneAndUpdate(
      { _id: notificationId, tenantId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(tenantId: string, userId: string) {
    return this.model.updateMany(
      { tenantId, userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, tenantId: string, userId: string) {
    return this.model.findOneAndDelete({
      _id: notificationId,
      tenantId,
      userId,
    });
  }

  /**
   * Delete all read notifications for a user
   */
  async deleteAllRead(tenantId: string, userId: string) {
    return this.model.deleteMany({
      tenantId,
      userId,
      isRead: true,
    });
  }

  /**
   * Create notification for multiple users
   */
  async createBulkNotifications(
    tenantId: string,
    userIds: string[],
    data: {
      title: string;
      message: string;
      type: any;
      link?: string;
      metadata?: any;
    }
  ) {
    const notifications = userIds.map(userId => ({
      tenantId,
      userId,
      ...data,
    })) as any;

    return this.bulkCreate(notifications, { tenantId });
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(
    tenantId: string,
    userId: string,
    type: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query = new QueryBuilder<INotification>(this.model)
      .withTenant(tenantId)
      .withUser(userId)
      .withFilter({ type })
      .paginate(page, limit)
      .sortBy('-createdAt');

    return query.execute();
  }

  /**
   * Get recent notifications (last 24 hours)
   */
  async getRecentNotifications(
    tenantId: string,
    userId: string,
    hours: number = 24
  ) {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    const query = new QueryBuilder<INotification>(this.model)
      .withTenant(tenantId)
      .withUser(userId)
      .withFilter({ createdAt: { $gte: startDate } })
      .sortBy('-createdAt');

    return query.executeAll();
  }

  /**
   * Delete old notifications (older than specified days)
   */
  async deleteOldNotifications(tenantId: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.model.deleteMany({
      tenantId,
      createdAt: { $lt: cutoffDate },
      isRead: true,
    });
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(tenantId: string, userId: string) {
    const [total, unread, byType] = await Promise.all([
      this.model.countDocuments({ tenantId, userId }),
      this.getUnreadCount(tenantId, userId),
      this.model.aggregate([
        { $match: { tenantId, userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.map(item => ({
        type: item._id,
        count: item.count,
      })),
    };
  }
}
