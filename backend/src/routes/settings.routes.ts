/**
 * Settings Routes
 */

import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { Permission } from '@shared/types/permissions';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get settings (all authenticated users can view)
router.get('/', SettingsController.getSettings);

// Update settings (Admin only)
router.put(
  '/',
  requirePermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  SettingsController.updateSettings
);

// Holiday management (Admin/HR only)
router.post(
  '/holidays',
  requirePermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  SettingsController.addHoliday
);

router.delete(
  '/holidays/:index',
  requirePermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  SettingsController.deleteHoliday
);

// Department management (Admin/HR only)
router.post(
  '/departments',
  requirePermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  SettingsController.addDepartment
);

router.delete(
  '/departments/:index',
  requirePermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  SettingsController.deleteDepartment
);

// Email settings (Admin only)
router.put(
  '/email',
  requirePermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  SettingsController.updateEmailSettings
);

export default router;
