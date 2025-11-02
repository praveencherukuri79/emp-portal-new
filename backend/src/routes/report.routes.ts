import { Router } from 'express';
import { ReportController } from '@controllers/report.controller';
import { authenticate } from '@middleware/auth.middleware';
import { authorize } from '@middleware/authorization.middleware';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Timesheet report
router.get('/timesheet', ReportController.getTimesheetReport);

// Leave report
router.get('/leave', ReportController.getLeaveReport);

// Team report (Supervisor/HR/Admin/Employer)
router.get('/team', authorize(UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), ReportController.getTeamReport);

export default router;
