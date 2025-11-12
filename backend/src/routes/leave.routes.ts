import { Router } from 'express';
import { LeaveController } from '@controllers/leave.controller';
import { authenticate } from '@middleware/auth.middleware';
import { authorize } from '@middleware/authorization.middleware';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee routes (EMPLOYER should NOT create leave requests)
router.post('/', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN), LeaveController.createLeaveRequest);
router.get('/my-requests', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN), LeaveController.getMyLeaveRequests);
router.get('/my-balance', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN), LeaveController.getMyLeaveBalance);
router.get('/calendar', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN), LeaveController.getLeaveCalendar);
router.put('/:leaveId', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN), LeaveController.updateLeaveRequest);
router.put('/:leaveId/cancel', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN), LeaveController.cancelLeaveRequest);

// Supervisor/HR/Admin/Employer routes
router.get('/approvals/pending', authorize(UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), LeaveController.getPendingApprovals);
router.put('/:leaveId/approve', authorize(UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), LeaveController.approveLeaveRequest);
router.put('/:leaveId/reject', authorize(UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), LeaveController.rejectLeaveRequest);

// HR/Admin/Employer routes
router.get('/statistics', authorize(UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), LeaveController.getLeaveStatistics);

export default router;
