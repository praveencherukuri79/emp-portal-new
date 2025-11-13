/**
 * Project Routes
 * Routes for project management
 */

import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { Permission } from '@shared/types/permissions';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all projects (available to all authenticated users for timesheet dropdown)
router.get('/', ProjectController.getAllProjects);

// Get active projects (for dropdowns)
router.get('/active', ProjectController.getActiveProjects);

// Get project by ID
router.get('/:projectId', ProjectController.getProjectById);

// Create project (Admin/HR only)
router.post(
  '/',
  requirePermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  ProjectController.createProject
);

// Update project (Admin/HR only)
router.put(
  '/:projectId',
  requirePermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  ProjectController.updateProject
);

// Delete/Archive project (Admin only)
router.delete(
  '/:projectId',
  requirePermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  ProjectController.deleteProject
);

export default router;
