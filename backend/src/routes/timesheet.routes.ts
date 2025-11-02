import { Router } from 'express';
import { TimesheetController } from '@controllers/timesheet.controller';
import { authenticate } from '@middleware/auth.middleware';
import { authorize } from '@middleware/authorization.middleware';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee routes - create and manage own timesheets
router.post('/entries', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), TimesheetController.createEntry);
router.post('/entries/batch', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), TimesheetController.batchCreateEntries);
router.get('/week/:weekStartDate', TimesheetController.getWeekEntries);
router.put('/entries/:entryId', TimesheetController.updateEntry);
router.delete('/entries/:entryId', TimesheetController.deleteEntry);
router.post('/submit', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), TimesheetController.submitWeek);
router.get('/history', TimesheetController.getHistory);

// Supervisor/HR/Admin/Employer routes - approvals
router.get('/approvals/pending', authorize(UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), TimesheetController.getPendingApprovals);
router.post('/approvals/approve', authorize(UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), TimesheetController.approveEntries);
router.post('/approvals/reject', authorize(UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), TimesheetController.rejectEntries);

export default router;
