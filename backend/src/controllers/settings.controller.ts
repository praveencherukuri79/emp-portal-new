import { Response } from 'express';
import { Tenant } from '../models';
import { ApiResponse } from '@utils/response.util';
import { IUpdateTenantRequest } from '@shared/types/requests';
import { IAuthRequest } from '../types';

/**
 * Settings Controller
 * Authenticated endpoints for tenant settings management
 * Accessible by ADMIN and EMPLOYER roles
 */
export class SettingsController {
  /**
   * Get tenant settings
   * GET /api/v1/settings/tenant
   * Requires: Authentication + ADMIN or EMPLOYER role
   */
  static async getTenant(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.tenantId) {
        return ApiResponse.unauthorized(res, 'Tenant context missing');
      }

      const tenant = await Tenant.findById(req.user.tenantId);

      if (!tenant) {
        return ApiResponse.error(res, 'Tenant not found', 404);
      }

      return ApiResponse.success(res, tenant, 'Tenant settings retrieved successfully');

    } catch (error: any) {
      console.error('Error getting tenant settings:', error);
      return ApiResponse.error(res, error.message || 'Failed to get tenant settings');
    }
  }

  /**
   * Update tenant settings
   * PUT /api/v1/settings/tenant
   * Requires: Authentication + ADMIN or EMPLOYER role
   */
  static async updateTenant(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.tenantId) {
        return ApiResponse.unauthorized(res, 'Tenant context missing');
      }

      const { name, domain, settings }: IUpdateTenantRequest = req.body;

      const tenant = await Tenant.findById(req.user.tenantId);

      if (!tenant) {
        return ApiResponse.error(res, 'Tenant not found', 404);
      }

      // Update fields if provided
      if (name) tenant.name = name;
      if (domain) tenant.domain = domain;
      if (settings) {
        tenant.settings = {
          ...tenant.settings,
          ...settings
        };
      }

      await tenant.save();

      return ApiResponse.success(res, tenant, 'Tenant settings updated successfully');

    } catch (error: any) {
      console.error('Error updating tenant settings:', error);
      return ApiResponse.error(res, error.message || 'Failed to update tenant settings');
    }
  }
}

