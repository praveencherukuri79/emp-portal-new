import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';
import { UserRole } from '@shared/types';

const router = Router();

/**
 * Settings Routes
 * Protected by authentication and role-based authorization
 * Accessible by ADMIN and EMPLOYER roles
 */

// Get tenant settings
router.get(
  '/tenant',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYER),
  SettingsController.getTenant
);

// Update tenant settings
router.put(
  '/tenant',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EMPLOYER),
  SettingsController.updateTenant
);

export default router;

