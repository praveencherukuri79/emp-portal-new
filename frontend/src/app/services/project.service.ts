/**
 * Project Service
 * Handles project-related API calls
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { IProjectResponse, IProjectsListResponse } from '@shared/types/responses';
import { buildHttpParams } from '../shared/utils/http.util';

export interface ProjectCreateRequest {
  name: string;
  code: string;
  description?: string;
  clientName?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  budget?: number;
  currency?: string;
  status?: 'active' | 'completed' | 'on-hold' | 'cancelled';
}

export interface ProjectUpdateRequest {
  name?: string;
  code?: string;
  description?: string;
  clientName?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  budget?: number;
  currency?: string;
  status?: 'active' | 'completed' | 'on-hold' | 'cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${API_ENDPOINTS.PROJECTS.ALL}`;
  private apiUrl = this.baseUrl; // Alias for consistency

  /**
   * Get all projects
   */
  getAllProjects(params?: { isActive?: boolean; search?: string }): Observable<IApiResponse<IProjectsListResponse>> {
    const httpParams = buildHttpParams(params || {});
    return this.http.get<IApiResponse<IProjectsListResponse>>(this.baseUrl, { params: httpParams });
  }

  /**
   * Get active projects only
   */
  getActiveProjects(): Observable<IApiResponse<IProjectsListResponse>> {
    return this.http.get<IApiResponse<IProjectsListResponse>>(`${this.baseUrl}/active`);
  }

  /**
   * Get project by ID
   */
  getProjectById(projectId: string): Observable<IApiResponse<IProjectResponse>> {
    return this.http.get<IApiResponse<IProjectResponse>>(`${this.baseUrl}/${projectId}`);
  }

  /**
   * Create new project
   */
  createProject(project: ProjectCreateRequest): Observable<IApiResponse<IProjectResponse>> {
    return this.http.post<IApiResponse<IProjectResponse>>(this.baseUrl, project);
  }

  /**
   * Update project
   */
  updateProject(projectId: string, updates: ProjectUpdateRequest): Observable<IApiResponse<IProjectResponse>> {
    return this.http.put<IApiResponse<IProjectResponse>>(`${this.baseUrl}/${projectId}`, updates);
  }

  /**
   * Archive project
   */
  archiveProject(projectId: string): Observable<IApiResponse<IProjectResponse>> {
    return this.http.delete<IApiResponse<IProjectResponse>>(`${this.baseUrl}/${projectId}`);
  }

  /**
   * Get current user's assigned projects
   */
  getMyProjects(): Observable<IApiResponse<{ projects: IProjectResponse[] }>> {
    return this.http.get<IApiResponse<{ projects: IProjectResponse[] }>>(`${this.apiUrl}/my-projects/list`);
  }

  /**
   * Assign users to a project
   */
  assignUsers(projectId: string, userIds: string[]): Observable<IApiResponse<IProjectResponse>> {
    return this.http.post<IApiResponse<IProjectResponse>>(
      `${this.apiUrl}/${projectId}/assign`,
      { userIds }
    );
  }

  /**
   * Remove user from a project
   */
  unassignUser(projectId: string, userId: string): Observable<IApiResponse<IProjectResponse>> {
    return this.http.delete<IApiResponse<IProjectResponse>>(
      `${this.apiUrl}/${projectId}/unassign/${userId}`
    );
  }

  /**
   * Get project team members
   */
  getProjectTeam(projectId: string): Observable<IApiResponse<{ projectId: string; projectName: string; team: any[] }>> {
    return this.http.get<IApiResponse<{ projectId: string; projectName: string; team: any[] }>>(
      `${this.apiUrl}/${projectId}/team`
    );
  }
}

