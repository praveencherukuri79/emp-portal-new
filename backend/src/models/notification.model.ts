import { Schema, model } from 'mongoose';
import { INotification, NotificationType, NotificationPriority } from '../types';

const notificationSchema = new Schema<INotification>({
  // Multi-tenant field
  tenantId: {
    type: String,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required'],
    index: true
  },

  // Recipient
  userId: {
    type: String,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Notification details
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: [true, 'Notification type is required'],
    index: true
  },

  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },

  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },

  // Related entity (optional)
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['timesheet', 'leave', 'document', 'user']
    },
    entityId: String
  },

  // Action link (optional)
  actionUrl: String,

  // Status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,

  // Priority
  priority: {
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM
  },

  // Email sent
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date

}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ tenantId: 1, userId: 1, isRead: 1 });
notificationSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
notificationSchema.index({ tenantId: 1, type: 1 });

// Auto-delete old notifications after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default model<INotification>('Notification', notificationSchema);
