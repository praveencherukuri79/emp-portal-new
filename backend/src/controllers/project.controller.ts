/**
 * Project Controller
 * Handles project management operations
 */

import { Response } from 'express';
import { Project } from '../models';
import { ApiResponse, RequestValidator } from '../utils';
import { IAuthRequest } from '../types';
import { IProjectResponse, IProjectsListResponse } from '@shared/types/responses';
import { toProjectResponse, toProjectsListResponse } from '../dto';
import ProjectService from '../services/project.service';

import { User } from '../models';

export class ProjectController {
  /**
   * Get all projects
   * GET /api/v1/projects
   */
  static async getAllProjects(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      // Validate tenant context
      if (!RequestValidator.validateTenantContext(req, res)) return;

      const { isActive, search } = req.query;

      const projects = await ProjectService.getAllProjects({
        tenantId: req.user!.tenantId,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        search: search as string | undefined
      });

      const responseData = toProjectsListResponse(projects);
      return ApiResponse.success<IProjectsListResponse>(
        res,
        responseData,
        'Projects retrieved successfully'
      );
    } catch (error) {
      console.error('Get all projects error:', error);
      return ApiResponse.error(res, 'Failed to retrieve projects', 500);
    }
  }

  /**
   * Get active projects only
   * GET /api/v1/projects/active
   */
  static async getActiveProjects(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;

      const projects = await ProjectService.getActiveProjects(req.user!.tenantId);

      const responseData = toProjectsListResponse(projects);
      return ApiResponse.success<IProjectsListResponse>(
        res,
        responseData,
        'Active projects retrieved successfully'
      );
    } catch (error) {
      console.error('Get active projects error:', error);
      return ApiResponse.error(res, 'Failed to retrieve active projects', 500);
    }
  }

  /**
   * Get project by ID
   * GET /api/v1/projects/:projectId
   */
  static async getProjectById(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { projectId } = req.params;

      if (!RequestValidator.validateTenantContext(req, res)) return;

      const idValidation = RequestValidator.validateObjectId(projectId, 'Project ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      const project = await ProjectService.getProjectById(projectId, req.user!.tenantId);

      if (!project) {
        return ApiResponse.notFound(res, 'Project not found');
      }

      const responseData = toProjectResponse(project);
      return ApiResponse.success<IProjectResponse>(
        res,
        responseData,
        'Project retrieved successfully'
      );
    } catch (error) {
      console.error('Get project by ID error:', error);
      return ApiResponse.error(res, 'Failed to retrieve project', 500);
    }
  }

  /**
   * Create new project
   * POST /api/v1/projects
   * Required: name, code
   */
  static async createProject(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { name, code, description, clientName, startDate, endDate, budget, currency, status } = req.body;

      if (!RequestValidator.validateTenantContext(req, res)) return;

      // Validate required fields
      if (!RequestValidator.validateRequiredFields(req.body, ['name', 'code'], res)) return;

      // Validate string lengths
      const nameValidation = RequestValidator.validateStringLength(name, 2, 100, 'Project name');
      if (!nameValidation.valid) {
        return ApiResponse.validationError(res, [nameValidation.error!]);
      }

      const codeValidation = RequestValidator.validateStringLength(code, 2, 20, 'Project code');
      if (!codeValidation.valid) {
        return ApiResponse.validationError(res, [codeValidation.error!]);
      }

      // Check if project code already exists
      const existing = await Project.findOne({
        tenantId: req.user!.tenantId,
        code: code.toUpperCase()
      });

      if (existing) {
        return ApiResponse.error(res, 'Project with this code already exists', 409);
      }

      // Validate date range if provided
      if (startDate && endDate) {
        const dateValidation = RequestValidator.validateDateRange(startDate, endDate);
        if (!dateValidation.valid) {
          return ApiResponse.validationError(res, [dateValidation.error!]);
        }
      }

      // Validate budget if provided
      if (budget !== undefined) {
        const budgetValidation = RequestValidator.validateNumericRange(budget, 0, 100000000, 'Budget');
        if (!budgetValidation.valid) {
          return ApiResponse.validationError(res, [budgetValidation.error!]);
        }
      }

      const project = await ProjectService.createProject({
        tenantId: req.user!.tenantId,
        name: RequestValidator.sanitizeString(name),
        code: code.toUpperCase().trim(),
        description: description ? RequestValidator.sanitizeString(description) : undefined,
        clientName: clientName ? RequestValidator.sanitizeString(clientName) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        budget,
        currency: currency || 'USD',
        status: status || 'active',
        isActive: true
      } as any);

      const responseData = toProjectResponse(project);
      return ApiResponse.created<IProjectResponse>(
        res,
        responseData,
        'Project created successfully'
      );
    } catch (error: any) {
      console.error('Create project error:', error);
      if (error.code === 11000) {
        return ApiResponse.error(res, 'Project with this code already exists', 409);
      }
      return ApiResponse.error(res, 'Failed to create project', 500);
    }
  }

  /**
   * Update project
   * PUT /api/v1/projects/:projectId
   */
  static async updateProject(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { projectId } = req.params;
      const { name, code, description, clientName, startDate, endDate, budget, currency, status } = req.body;

      if (!RequestValidator.validateTenantContext(req, res)) return;

      const idValidation = RequestValidator.validateObjectId(projectId, 'Project ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      // Validate date range if both provided
      if (startDate && endDate) {
        const dateValidation = RequestValidator.validateDateRange(startDate, endDate);
        if (!dateValidation.valid) {
          return ApiResponse.validationError(res, [dateValidation.error!]);
        }
      }

      const updates: any = {};
      if (name) {
        const nameValidation = RequestValidator.validateStringLength(name, 2, 100, 'Project name');
        if (!nameValidation.valid) {
          return ApiResponse.validationError(res, [nameValidation.error!]);
        }
        updates.name = RequestValidator.sanitizeString(name);
      }
      if (code) {
        const codeValidation = RequestValidator.validateStringLength(code, 2, 20, 'Project code');
        if (!codeValidation.valid) {
          return ApiResponse.validationError(res, [codeValidation.error!]);
        }
        updates.code = code.toUpperCase().trim();
      }
      if (description) updates.description = RequestValidator.sanitizeString(description);
      if (clientName) updates.clientName = RequestValidator.sanitizeString(clientName);
      if (startDate) updates.startDate = new Date(startDate);
      if (endDate) updates.endDate = new Date(endDate);
      if (budget !== undefined) updates.budget = budget;
      if (currency) updates.currency = currency;
      if (status) updates.status = status;

      const project = await ProjectService.updateProject(
        projectId,
        req.user!.tenantId,
        updates
      );

      if (!project) {
        return ApiResponse.notFound(res, 'Project not found');
      }

      const responseData = toProjectResponse(project);
      return ApiResponse.success<IProjectResponse>(
        res,
        responseData,
        'Project updated successfully'
      );
    } catch (error: any) {
      console.error('Update project error:', error);
      if (error.code === 11000) {
        return ApiResponse.error(res, 'Project with this code already exists', 409);
      }
      return ApiResponse.error(res, 'Failed to update project', 500);
    }
  }

  /**
   * Delete/Archive project
   * DELETE /api/v1/projects/:projectId
   */
  static async deleteProject(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { projectId } = req.params;

      if (!RequestValidator.validateTenantContext(req, res)) return;

      const idValidation = RequestValidator.validateObjectId(projectId, 'Project ID');
      if (!idValidation.valid) {
        return ApiResponse.validationError(res, [idValidation.error!]);
      }

      const project = await ProjectService.archiveProject(projectId, req.user!.tenantId);

      if (!project) {
        return ApiResponse.notFound(res, 'Project not found');
      }

      const responseData = toProjectResponse(project);
      return ApiResponse.success<IProjectResponse>(
        res,
        responseData,
        'Project archived successfully'
      );
    } catch (error) {
      console.error('Delete project error:', error);
      return ApiResponse.error(res, 'Failed to archive project', 500);
    }
  }
}
