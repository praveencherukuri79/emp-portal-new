/**
 * Project Routes
 * Routes for project management
 */

import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { ProjectAssignmentController } from '../controllers/project.controller.assignment';
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

// Get current user's assigned projects
router.get('/my-projects/list', ProjectAssignmentController.getMyProjects);

// Get project by ID
router.get('/:projectId', ProjectController.getProjectById);

// Get project team members
router.get('/:id/team', ProjectAssignmentController.getProjectTeam);

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

// Assign users to project (Admin/HR only)
router.post(
  '/:id/assign',
  requirePermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  ProjectAssignmentController.assignUsers
);

// Remove user from project (Admin/HR only)
router.delete(
  '/:id/unassign/:userId',
  requirePermission(Permission.CAN_MANAGE_SYSTEM_SETTINGS),
  ProjectAssignmentController.unassignUser
);

export default router;
