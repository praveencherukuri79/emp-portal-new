import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

/**
 * Admin Routes
 * Protected by ADMIN_SECRET_KEY in headers (x-admin-secret)
 * 
 * IMPORTANT: These endpoints are for manual user creation only
 * They bypass normal authentication and should be kept secure
 */

// Create single user
router.post('/create-user', AdminController.createUser);

// Bulk create users
router.post('/bulk-create-users', AdminController.bulkCreateUsers);

// Get tenant info
router.get('/tenant', AdminController.getTenant);

// Update tenant
router.put('/tenant', AdminController.updateTenant);

export default router;
