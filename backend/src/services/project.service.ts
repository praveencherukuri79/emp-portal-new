/**
 * Project Service
 * Business logic for project management
 */

import { Project, IProject } from '../models/project.model';

interface IProjectFilters {
  tenantId: string;
  isActive?: boolean;
  search?: string;
}

export class ProjectService {
  /**
   * Get all projects for tenant
   */
  static async getAllProjects(filters: IProjectFilters) {
    const query: any = { tenantId: filters.tenantId };

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    return await Project.find(query).sort({ name: 1 });
  }

  /**
   * Get project by ID
   */
  static async getProjectById(projectId: string, tenantId: string) {
    return await Project.findOne({ _id: projectId, tenantId });
  }

  /**
   * Create new project
   */
  static async createProject(projectData: Partial<IProject>) {
    const project = new Project(projectData);
    return await project.save();
  }

  /**
   * Update project
   */
  static async updateProject(
    projectId: string,
    tenantId: string,
    updates: Partial<IProject>
  ) {
    return await Project.findOneAndUpdate(
      { _id: projectId, tenantId },
      updates,
      { new: true }
    );
  }

  /**
   * Delete/Archive project
   */
  static async archiveProject(projectId: string, tenantId: string) {
    return await Project.findOneAndUpdate(
      { _id: projectId, tenantId },
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Get active projects only
   */
  static async getActiveProjects(tenantId: string) {
    return await Project.find({ tenantId, isActive: true }).sort({ name: 1 });
  }
}

export default ProjectService;

