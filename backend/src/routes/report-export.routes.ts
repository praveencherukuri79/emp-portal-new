/**
 * Report Export Routes
 * Routes for exporting reports
 */

import { Router } from 'express';
import { ReportExportController } from '../controllers/report-export.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { Permission } from '@shared/types/permissions';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Export timesheet report
router.post(
  '/timesheet/export',
  requirePermission(Permission.CAN_VIEW_TEAM_REPORTS),
  ReportExportController.exportTimesheetReport
);

// Export leave report
router.post(
  '/leave/export',
  requirePermission(Permission.CAN_VIEW_TEAM_REPORTS),
  ReportExportController.exportLeaveReport
);

// Export team report
router.post(
  '/team/export',
  requirePermission(Permission.CAN_VIEW_TEAM_REPORTS),
  ReportExportController.exportTeamReport
);

export default router;

