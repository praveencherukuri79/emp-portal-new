/**
 * Project Service
 * Handles project-related API calls
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { IProjectResponse, IProjectsListResponse } from '@shared/types/responses';
import { ResponseHandler } from '../shared/utils';

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
    let httpParams = new HttpParams();
    if (params?.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
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
}
