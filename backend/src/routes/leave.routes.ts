import { Router } from 'express';
import { LeaveController } from '@controllers/leave.controller';
import { authenticate } from '@middleware/auth.middleware';
import { authorize } from '@middleware/authorization.middleware';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), LeaveController.createLeaveRequest);
router.get('/my-requests', LeaveController.getMyLeaveRequests);
router.get('/my-balance', LeaveController.getMyLeaveBalance);
router.get('/calendar', LeaveController.getLeaveCalendar);
router.put('/:leaveId', LeaveController.updateLeaveRequest);
router.put('/:leaveId/cancel', LeaveController.cancelLeaveRequest);

// Supervisor/HR/Admin/Employer routes
router.get('/approvals/pending', authorize(UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), LeaveController.getPendingApprovals);
router.put('/:leaveId/approve', authorize(UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), LeaveController.approveLeaveRequest);
router.put('/:leaveId/reject', authorize(UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), LeaveController.rejectLeaveRequest);

// HR/Admin/Employer routes
router.get('/statistics', authorize(UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), LeaveController.getLeaveStatistics);

export default router;
