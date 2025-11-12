import { IProjectResponse } from '@shared/types/responses';

interface ProjectData {
  _id: string;
  tenantId: string | { toString(): string };
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Convert project object to IProjectResponse
 */
export function toProjectResponse(project: ProjectData): IProjectResponse {
  return {
    _id: project._id,
    tenantId: String(project.tenantId),
    name: project.name,
    code: project.code,
    description: project.description,
    isActive: project.isActive,
    createdAt: project.createdAt || new Date(),
    updatedAt: project.updatedAt || new Date()
  };
}

/**
 * Convert array of project objects to IProjectResponse[]
 */
export function toProjectResponseArray(projects: ProjectData[]): IProjectResponse[] {
  return projects.map(toProjectResponse);
}

