import { Router } from 'express';
import { NotificationController } from '@controllers/notification.controller';
import { authenticate } from '@middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', NotificationController.getMyNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark as read
router.put('/:notificationId/read', NotificationController.markAsRead);
router.put('/mark-all-read', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', NotificationController.deleteNotification);

export default router;
