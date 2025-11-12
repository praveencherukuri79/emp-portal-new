import { Response } from 'express';
import { IAuthRequest } from '../types';
import EmployerService from '../services/employer.service';
import { ApiResponse } from '../utils';
import { IWorkforceOverviewResponse, IFinancialOverviewResponse, IAnalyticsOverviewResponse } from '@shared/types/responses';

const VALID_PERIODS = new Set(['month', 'quarter', 'year']);

class EmployerController {
  static async getWorkforceOverview(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.tenantId) {
        return ApiResponse.unauthorized(res, 'Tenant context missing');
      }

      const data = await EmployerService.getWorkforceOverview(req.user.tenantId);
      return ApiResponse.success<IWorkforceOverviewResponse>(res, data, 'Workforce overview retrieved successfully');
    } catch (error) {
      console.error('Failed to retrieve workforce overview', error);
      return ApiResponse.error(res, 'Failed to retrieve workforce overview');
    }
  }

  static async getFinancialOverview(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.tenantId) {
        return ApiResponse.unauthorized(res, 'Tenant context missing');
      }

      const periodQuery = String(req.query.period || 'month').toLowerCase();
      const period = VALID_PERIODS.has(periodQuery) ? (periodQuery as 'month' | 'quarter' | 'year') : 'month';

      const data = await EmployerService.getFinancialOverview(req.user.tenantId, period);
      return ApiResponse.success<IFinancialOverviewResponse>(res, data, 'Financial overview retrieved successfully');
    } catch (error) {
      console.error('Failed to retrieve financial overview', error);
      return ApiResponse.error(res, 'Failed to retrieve financial overview');
    }
  }

  static async getBusinessAnalytics(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user?.tenantId) {
        return ApiResponse.unauthorized(res, 'Tenant context missing');
      }

      const data = await EmployerService.getBusinessAnalytics(req.user.tenantId);
      return ApiResponse.success<IAnalyticsOverviewResponse>(res, data, 'Business analytics retrieved successfully');
    } catch (error) {
      console.error('Failed to retrieve business analytics', error);
      return ApiResponse.error(res, 'Failed to retrieve business analytics');
    }
  }
}

export default EmployerController;

