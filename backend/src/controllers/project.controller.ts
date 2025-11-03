import { Response } from 'express';
import { TimesheetEntry } from '../models';
import { ApiResponse } from '../utils/response.util';
import { IAuthRequest } from '../types';

export class ProjectController {
  /**
   * Get all unique projects from timesheet entries + default projects
   */
  static getAllProjects = async (req: IAuthRequest, res: Response): Promise<void> => {
    const { tenantId } = req.user!;

    // Get projects from existing timesheet entries
    const existingProjects = await TimesheetEntry.distinct('project', { 
      tenantId,
      project: { $exists: true, $ne: null }
    });

    const projectsFromEntries = existingProjects
      .filter((name: string) => name && name.trim())
      .map((projectName: string) => ({
        _id: projectName.toLowerCase().replace(/\s+/g, '-'),
        tenantId,
        name: projectName,
        code: projectName.substring(0, 3).toUpperCase(),
        isActive: true
      }));

    // Default projects if none exist
    const defaultProjects = [
      {
        _id: 'general-tasks',
        tenantId,
        name: 'General Tasks',
        code: 'GEN',
        isActive: true
      },
      {
        _id: 'client-project-a',
        tenantId,
        name: 'Client Project A',
        code: 'CPA',
        isActive: true
      },
      {
        _id: 'client-project-b',
        tenantId,
        name: 'Client Project B',
        code: 'CPB',
        isActive: true
      },
      {
        _id: 'internal-development',
        tenantId,
        name: 'Internal Development',
        code: 'INT',
        isActive: true
      },
      {
        _id: 'training',
        tenantId,
        name: 'Training & Learning',
        code: 'TRN',
        isActive: true
      },
      {
        _id: 'meetings',
        tenantId,
        name: 'Meetings & Coordination',
        code: 'MTG',
        isActive: true
      }
    ];

    // Combine and deduplicate
    const allProjectNames = new Set([
      ...projectsFromEntries.map(p => p.name),
      ...defaultProjects.map(p => p.name)
    ]);

    const projectList = Array.from(allProjectNames).map(name => {
      const existing = projectsFromEntries.find(p => p.name === name);
      if (existing) return existing;
      
      const defaultProj = defaultProjects.find(p => p.name === name);
      return defaultProj!;
    });

    ApiResponse.success(res, projectList);
  };
}

