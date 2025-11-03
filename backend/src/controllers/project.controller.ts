import { Response } from 'express';
import { TimesheetEntry } from '../models';
import { ApiResponse } from '../utils/response.util';
import { IAuthRequest } from '../types';

export class ProjectController {
  /**
   * Get all unique projects from timesheet entries
   */
  static getAllProjects = async (req: IAuthRequest, res: Response): Promise<void> => {
    const { tenantId } = req.user!;

    const projects = await TimesheetEntry.distinct('project', { 
      tenantId,
      project: { $exists: true, $ne: null }
    });

    const projectList = projects
      .filter((name: string) => name && name.trim())
      .map((projectName: string) => ({
        _id: projectName.toLowerCase().replace(/\s+/g, '-'),
        tenantId,
        name: projectName,
        code: projectName.substring(0, 3).toUpperCase(),
        isActive: true
      }));

    ApiResponse.success(res, projectList);
  };
}
