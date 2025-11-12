import { Router } from 'express';
import EmployerController from '../controllers/employer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireEmployer } from '../middleware/authorization.middleware';

const router = Router();

router.use(authenticate, requireEmployer);

router.get('/workforce', EmployerController.getWorkforceOverview);
router.get('/financial', EmployerController.getFinancialOverview);
router.get('/analytics', EmployerController.getBusinessAnalytics);

export default router;

