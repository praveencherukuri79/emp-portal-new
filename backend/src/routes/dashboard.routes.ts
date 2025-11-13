import { Router } from 'express';
import { DashboardController } from '@controllers/dashboard.controller';
import { authenticate } from '@middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get role-based dashboard (generic - determines role automatically)
router.get('/', DashboardController.getDashboard);

// Specific role dashboards
router.get('/admin', DashboardController.getAdminDashboard);
router.get('/employee', DashboardController.getEmployeeDashboard);
router.get('/hr', DashboardController.getHRDashboard);
router.get('/supervisor', DashboardController.getSupervisorDashboard);
router.get('/employer', DashboardController.getEmployerDashboard);
router.get('/prospect', DashboardController.getProspectDashboard);

export default router;
