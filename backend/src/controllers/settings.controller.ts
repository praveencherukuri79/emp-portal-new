/**
 * Settings Controller
 * Handles organization and system settings
 */

import { Response } from 'express';
import { OrganizationSettings } from '../models/settings.model';
import { ApiResponse, RequestValidator } from '../utils';
import { IAuthRequest } from '../types';

export class SettingsController {
  /**
   * Get organization settings
   * GET /api/v1/settings
   */
  static async getSettings(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;

      let settings = await OrganizationSettings.findOne({ tenantId: req.user!.tenantId });
      
      if (!settings) {
        // Create default settings
        settings = new OrganizationSettings({
          tenantId: req.user!.tenantId,
          organizationName: 'My Organization',
          workingHours: {
            startTime: '09:00',
            endTime: '17:00',
            breakDuration: 60,
            workingDaysPerWeek: 5
          },
          holidays: [],
          departments: [],
          leavePolicies: [
            { leaveType: 'annual', annualAllocation: 20, accrualRate: 1.67, maxCarryOver: 5, allowNegativeBalance: false, requiresApproval: true },
            { leaveType: 'sick', annualAllocation: 10, accrualRate: 0.83, maxCarryOver: 0, allowNegativeBalance: false, requiresApproval: true },
            { leaveType: 'personal', annualAllocation: 5, accrualRate: 0.42, maxCarryOver: 0, allowNegativeBalance: false, requiresApproval: true }
          ],
          emailSettings: {},
          notificationSettings: {
            emailNotificationsEnabled: true,
            inAppNotificationsEnabled: true,
            notifyOnTimesheetSubmission: true,
            notifyOnLeaveRequest: true,
            notifyOnApproval: true
          },
          fiscalYearStart: 1,
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h'
        });
        await settings.save();
      }

      return ApiResponse.success(res, settings, 'Settings retrieved successfully');
    } catch (error) {
      console.error('Get settings error:', error);
      return ApiResponse.error(res, 'Failed to retrieve settings', 500);
    }
  }

  /**
   * Update organization settings
   * PUT /api/v1/settings
   */
  static async updateSettings(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;

      const settings = await OrganizationSettings.findOneAndUpdate(
        { tenantId: req.user!.tenantId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!settings) {
        return ApiResponse.notFound(res, 'Settings not found');
      }

      return ApiResponse.success(res, settings, 'Settings updated successfully');
    } catch (error) {
      console.error('Update settings error:', error);
      return ApiResponse.error(res, 'Failed to update settings', 500);
    }
  }

  /**
   * Add holiday
   * POST /api/v1/settings/holidays
   */
  static async addHoliday(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;

      const { name, date, isRecurring } = req.body;

      if (!name || !date) {
        return ApiResponse.validationError(res, ['Name and date are required']);
      }

      const settings = await OrganizationSettings.findOne({ tenantId: req.user!.tenantId });
      
      if (!settings) {
        return ApiResponse.notFound(res, 'Settings not found');
      }

      settings.holidays.push({ name, date: new Date(date), isRecurring: isRecurring || false });
      await settings.save();

      return ApiResponse.success(res, settings.holidays, 'Holiday added successfully');
    } catch (error) {
      console.error('Add holiday error:', error);
      return ApiResponse.error(res, 'Failed to add holiday', 500);
    }
  }

  /**
   * Delete holiday
   * DELETE /api/v1/settings/holidays/:index
   */
  static async deleteHoliday(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;

      const index = parseInt(req.params.index);
      
      if (isNaN(index) || index < 0) {
        return ApiResponse.validationError(res, ['Invalid index']);
      }

      const settings = await OrganizationSettings.findOne({ tenantId: req.user!.tenantId });
      
      if (!settings) {
        return ApiResponse.notFound(res, 'Settings not found');
      }

      if (index >= settings.holidays.length) {
        return ApiResponse.notFound(res, 'Holiday not found');
      }

      settings.holidays.splice(index, 1);
      await settings.save();

      return ApiResponse.success(res, settings.holidays, 'Holiday deleted successfully');
    } catch (error) {
      console.error('Delete holiday error:', error);
      return ApiResponse.error(res, 'Failed to delete holiday', 500);
    }
  }

  /**
   * Add department
   * POST /api/v1/settings/departments
   */
  static async addDepartment(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;

      const { name, code, managerId } = req.body;

      if (!name || !code) {
        return ApiResponse.validationError(res, ['Name and code are required']);
      }

      const settings = await OrganizationSettings.findOne({ tenantId: req.user!.tenantId });
      
      if (!settings) {
        return ApiResponse.notFound(res, 'Settings not found');
      }

      settings.departments.push({
        name,
        code: code.toUpperCase(),
        managerId,
        isActive: true
      });
      
      await settings.save();

      return ApiResponse.success(res, settings.departments, 'Department added successfully');
    } catch (error) {
      console.error('Add department error:', error);
      return ApiResponse.error(res, 'Failed to add department', 500);
    }
  }

  /**
   * Delete department
   * DELETE /api/v1/settings/departments/:index
   */
  static async deleteDepartment(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;

      const index = parseInt(req.params.index);
      
      if (isNaN(index) || index < 0) {
        return ApiResponse.validationError(res, ['Invalid index']);
      }

      const settings = await OrganizationSettings.findOne({ tenantId: req.user!.tenantId });
      
      if (!settings) {
        return ApiResponse.notFound(res, 'Settings not found');
      }

      if (index >= settings.departments.length) {
        return ApiResponse.notFound(res, 'Department not found');
      }

      settings.departments.splice(index, 1);
      await settings.save();

      return ApiResponse.success(res, settings.departments, 'Department deleted successfully');
    } catch (error) {
      console.error('Delete department error:', error);
      return ApiResponse.error(res, 'Failed to delete department', 500);
    }
  }

  /**
   * Update email settings
   * PUT /api/v1/settings/email
   */
  static async updateEmailSettings(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateTenantContext(req, res)) return;

      const settings = await OrganizationSettings.findOneAndUpdate(
        { tenantId: req.user!.tenantId },
        { $set: { emailSettings: req.body } },
        { new: true }
      );

      if (!settings) {
        return ApiResponse.notFound(res, 'Settings not found');
      }

      return ApiResponse.success(res, settings.emailSettings, 'Email settings updated successfully');
    } catch (error) {
      console.error('Update email settings error:', error);
      return ApiResponse.error(res, 'Failed to update email settings', 500);
    }
  }
}
