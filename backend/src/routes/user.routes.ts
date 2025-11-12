import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize, authorizeSelfOrRole } from '../middleware/authorization.middleware';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile routes (any authenticated user)
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

// Get team members (Supervisor)
router.get('/team', authorize(UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), UserController.getTeamMembers);

// User management (Admin/HR/Employer)
router.get('/', authorize(UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), UserController.getAllUsers);
router.post('/', authorize(UserRole.ADMIN), UserController.createUser);

// Get user by ID (Admin/HR/Employer or self)
router.get('/:userId', authorizeSelfOrRole(UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), UserController.getUserById);

// Update employee information (Admin/HR)
router.put('/:userId/employee-info', authorize(UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), UserController.updateEmployeeInfo);

// Update user role (Admin only)
router.put('/:userId/role', authorize(UserRole.ADMIN), UserController.updateUserRole);

// Activate/deactivate user (Admin only)
router.put('/:userId/activate', authorize(UserRole.ADMIN), UserController.activateUser);
router.put('/:userId/deactivate', authorize(UserRole.ADMIN), UserController.deactivateUser);

export default router;
