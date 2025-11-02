import { Router } from 'express';
import { DashboardController } from '@controllers/dashboard.controller';
import { authenticate } from '@middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get role-based dashboard
router.get('/', DashboardController.getDashboard);

export default router;
