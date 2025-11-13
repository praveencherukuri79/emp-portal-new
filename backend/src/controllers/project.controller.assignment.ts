/**
 * Project Assignment Controller Methods
 * Handles user assignment to projects
 */

import { Response } from 'express';
import { Project, User } from '../models';
import { ApiResponse, RequestValidator } from '../utils';
import { IAuthRequest } from '../types';
import { toProjectResponse } from '../dto';

export class ProjectAssignmentController {
  /**
   * Assign users to a project
   * POST /api/v1/projects/:id/assign
   * Body: { userIds: string[] }
   */
  static async assignUsers(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;
      
      const idValidation = RequestValidator.validateObjectId(req.params.id, 'Project ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      const { userIds } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return ApiResponse.validationError(res, ['User IDs array is required']);
      }

      // Validate all user IDs
      for (const userId of userIds) {
        const userIdValidation = RequestValidator.validateObjectId(userId, 'User ID');
        if (!userIdValidation.valid) {
          return ApiResponse.validationError(res, [userIdValidation.error!]);
        }
      }

      const project = await Project.findOne({
        _id: req.params.id,
        tenantId: req.user!.tenantId
      });

      if (!project) {
        return ApiResponse.notFound(res, 'Project not found');
      }

      // Verify all users exist and belong to same tenant
      const users = await User.find({
        _id: { $in: userIds },
        tenantId: req.user!.tenantId
      });

      if (users.length !== userIds.length) {
        return ApiResponse.validationError(res, ['One or more users not found or do not belong to your organization']);
      }

      // Add users to project (avoid duplicates)
      const existingUserIds = project.assignedUsers.map(id => id.toString());
      const newUserIds = userIds.filter((id: string) => !existingUserIds.includes(id));
      
      if (newUserIds.length === 0) {
        return ApiResponse.error(res, 'All selected users are already assigned to this project', 400);
      }

      project.assignedUsers.push(...newUserIds);
      await project.save();

      const populatedProject = await Project.findById(project._id)
        .populate('assignedUsers', 'firstName lastName email employeeId');

      const responseData = toProjectResponse(populatedProject!);
      return ApiResponse.success(
        res,
        responseData,
        `${newUserIds.length} user(s) assigned to project successfully`
      );
    } catch (error) {
      console.error('Assign users error:', error);
      return ApiResponse.error(res, 'Failed to assign users to project', 500);
    }
  }

  /**
   * Remove a user from a project
   * DELETE /api/v1/projects/:id/unassign/:userId
   */
  static async unassignUser(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;
      
      const idValidation = RequestValidator.validateObjectId(req.params.id, 'Project ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      const userIdValidation = RequestValidator.validateObjectId(req.params.userId, 'User ID');
      if (!userIdValidation.valid) {
        return ApiResponse.validationError(res, [userIdValidation.error!]);
      }

      const project = await Project.findOne({
        _id: req.params.id,
        tenantId: req.user!.tenantId
      });

      if (!project) {
        return ApiResponse.notFound(res, 'Project not found');
      }

      const userIdStr = req.params.userId;
      const initialLength = project.assignedUsers.length;
      
      project.assignedUsers = project.assignedUsers.filter(
        (id: any) => id.toString() !== userIdStr
      );

      if (project.assignedUsers.length === initialLength) {
        return ApiResponse.error(res, 'User is not assigned to this project', 400);
      }

      await project.save();

      const populatedProject = await Project.findById(project._id)
        .populate('assignedUsers', 'firstName lastName email employeeId');

      const responseData = toProjectResponse(populatedProject!);
      return ApiResponse.success(
        res,
        responseData,
        'User removed from project successfully'
      );
    } catch (error) {
      console.error('Unassign user error:', error);
      return ApiResponse.error(res, 'Failed to remove user from project', 500);
    }
  }

  /**
   * Get project team members
   * GET /api/v1/projects/:id/team
   */
  static async getProjectTeam(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;
      
      const idValidation = RequestValidator.validateObjectId(req.params.id, 'Project ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      const project = await Project.findOne({
        _id: req.params.id,
        tenantId: req.user!.tenantId
      }).populate('assignedUsers', 'firstName lastName email employeeId department designation');

      if (!project) {
        return ApiResponse.notFound(res, 'Project not found');
      }

      return ApiResponse.success(
        res,
        { 
          projectId: project._id,
          projectName: project.name,
          team: project.assignedUsers || []
        },
        'Project team retrieved successfully'
      );
    } catch (error) {
      console.error('Get project team error:', error);
      return ApiResponse.error(res, 'Failed to retrieve project team', 500);
    }
  }

  /**
   * Get current user's assigned projects
   * GET /api/v1/projects/my-projects
   */
  static async getMyProjects(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;

      const userId = req.user!.userId;

      const projects = await Project.find({
        tenantId: req.user!.tenantId,
        isActive: true,
        assignedUsers: userId
      }).sort({ name: 1 });

      return ApiResponse.success(
        res,
        { projects },
        'My projects retrieved successfully'
      );
    } catch (error) {
      console.error('Get my projects error:', error);
      return ApiResponse.error(res, 'Failed to retrieve your projects', 500);
    }
  }
}

