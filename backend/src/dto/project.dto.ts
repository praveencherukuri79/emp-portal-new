/**
 * Project DTOs
 * Convert Project models to API responses
 */

import { IProjectResponse, IProjectsListResponse } from '@shared/types/responses';
import { Document } from 'mongoose';
import { IProject } from '../models/project.model';

/**
 * Convert Project model to IProjectResponse
 */
export function toProjectResponse(project: Document & IProject): IProjectResponse {
  return {
    _id: String(project._id),
    tenantId: String(project.tenantId),
    name: project.name,
    code: project.code,
    description: project.description,
    isActive: project.isActive,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

/**
 * Convert array of Project models to IProjectsListResponse
 */
export function toProjectsListResponse(projects: (Document & IProject)[]): IProjectsListResponse {
  return {
    projects: projects.map(toProjectResponse)
  };
}
