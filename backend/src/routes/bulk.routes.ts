/**
 * Bulk Operations Routes
 * Routes for bulk operations across modules
 */

import { Router } from 'express';
import { BulkController } from '../controllers/bulk.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { Permission } from '@shared/types/permissions';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Bulk create users (Admin only)
router.post(
  '/users',
  requirePermission(Permission.CAN_CREATE_USERS),
  BulkController.bulkCreateUsers
);

// Bulk update user roles (Admin only)
router.put(
  '/users/roles',
  requirePermission(Permission.CAN_MANAGE_ROLES),
  BulkController.bulkUpdateUserRoles
);

// Bulk update user status (Admin only)
router.put(
  '/users/status',
  requirePermission(Permission.CAN_EDIT_USERS),
  BulkController.bulkUpdateUserStatus
);

// Bulk approve timesheets (Supervisor/HR/Admin/Employer)
router.post(
  '/timesheets/approve',
  requirePermission(Permission.CAN_APPROVE_TEAM_TIMESHEET),
  BulkController.bulkApproveTimesheets
);

// Bulk delete draft timesheets (Employee)
router.delete(
  '/timesheets/draft',
  authenticate,
  BulkController.bulkDeleteDraftTimesheets
);

// Bulk share documents
router.post(
  '/documents/share',
  requirePermission(Permission.CAN_UPLOAD_DOCUMENTS),
  BulkController.bulkShareDocuments
);

export default router;

