/**
 * Bulk Operations Controller
 * Handles bulk operations for users, timesheets, and documents
 */

import { Response } from 'express';
import { User, TimesheetEntry, Document } from '../models';
import { ApiResponse, RequestValidator, BusinessLogic } from '../utils';
import { IAuthRequest, UserRole, TimesheetStatus } from '../types';
import { IBulkCreateUsersRequest } from '@shared/types/requests';
import { toUserResponse } from '../dto';

export class BulkController {
  /**
   * Bulk create users (Admin only)
   * POST /api/v1/bulk/users
   */
  static async bulkCreateUsers(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { users }: IBulkCreateUsersRequest = req.body;

      // Validate tenant context
      if (!RequestValidator.validateTenantContext(req, res)) return;

      if (!Array.isArray(users) || users.length === 0) {
        return ApiResponse.validationError(res, ['Users array is required and must not be empty']);
      }

      if (users.length > 100) {
        return ApiResponse.error(res, 'Maximum 100 users can be created at once', 400);
      }

      const createdUsers = [];
      const errors: string[] = [];

      for (const userData of users) {
        try {
          // Validate required fields
          if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
            errors.push(`User ${userData.email || 'unknown'}: Missing required fields`);
            continue;
          }

          // Validate email
          const emailValidation = RequestValidator.validateEmail(userData.email);
          if (!emailValidation.valid) {
            errors.push(`User ${userData.email}: ${emailValidation.error}`);
            continue;
          }

          // Check if user exists
          const existing = await User.findOne({
            email: userData.email,
            tenantId: req.user!.tenantId
          });

          if (existing) {
            errors.push(`User ${userData.email}: Already exists`);
            continue;
          }

          // Create user
          const user = new User({
            ...userData,
            tenantId: req.user!.tenantId,
            isActive: true
          });

          await user.save();
          createdUsers.push(toUserResponse(user));
        } catch (error: any) {
          errors.push(`User ${userData.email}: ${error.message}`);
        }
      }

      const response = {
        created: createdUsers.length,
        failed: errors.length,
        users: createdUsers,
        errors
      };

      if (createdUsers.length === 0) {
        return ApiResponse.error(res, 'Failed to create any users', 400, errors);
      }

      return ApiResponse.created(res, response, `${createdUsers.length} users created, ${errors.length} failed`);
    } catch (error) {
      console.error('Bulk create users error:', error);
      return ApiResponse.error(res, 'Failed to bulk create users', 500);
    }
  }

  /**
   * Bulk approve timesheets
   * POST /api/v1/bulk/timesheets/approve
   */
  static async bulkApproveTimesheets(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { weekStartDates, userIds, comments } = req.body;

      if (!RequestValidator.validateTenantContext(req, res)) return;

      if (!Array.isArray(weekStartDates) || weekStartDates.length === 0) {
        return ApiResponse.validationError(res, ['Week start dates array is required']);
      }

      let query: any = {
        tenantId: req.user!.tenantId,
        status: TimesheetStatus.SUBMITTED
      };

      // Filter by users if provided
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        query.userId = { $in: userIds };
      }

      // Filter by weeks
      const weekRanges = weekStartDates.map((dateStr: string) => {
        const { weekStart, weekEnd } = BusinessLogic.getWeekDates(dateStr);
        return { weekStartDate: weekStart, weekEndDate: weekEnd };
      });

      const entries = await TimesheetEntry.find(query);

      // Filter entries that match any of the week ranges
      const entriesToApprove = entries.filter(entry => 
        weekRanges.some(range => 
          entry.weekStartDate.getTime() === range.weekStartDate.getTime()
        )
      );

      if (entriesToApprove.length === 0) {
        return ApiResponse.notFound(res, 'No submitted timesheets found for the specified weeks');
      }

      // Approve all entries
      const updatePromises = entriesToApprove.map(entry => {
        entry.status = TimesheetStatus.APPROVED;
        entry.approvedBy = req.user?.userId;
        entry.approvedAt = new Date();
        if (comments) entry.approvalComments = comments;
        return entry.save();
      });

      await Promise.all(updatePromises);

      return ApiResponse.success(res, {
        count: entriesToApprove.length,
        weeks: weekStartDates.length
      }, `Approved ${entriesToApprove.length} entries across ${weekStartDates.length} weeks`);
    } catch (error) {
      console.error('Bulk approve timesheets error:', error);
      return ApiResponse.error(res, 'Failed to bulk approve timesheets', 500);
    }
  }

  /**
   * Bulk delete draft timesheets
   * DELETE /api/v1/bulk/timesheets/draft
   */
  static async bulkDeleteDraftTimesheets(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { weekStartDate } = req.body;

      if (!RequestValidator.validateTenantContext(req, res)) return;
      if (!RequestValidator.validateUserContext(req, res)) return;

      if (!weekStartDate) {
        return ApiResponse.validationError(res, ['Week start date is required']);
      }

      const { weekStart, weekEnd } = BusinessLogic.getWeekDates(weekStartDate);

      const result = await TimesheetEntry.deleteMany({
        tenantId: req.user!.tenantId,
        userId: req.user!.userId,
        weekStartDate: weekStart,
        status: TimesheetStatus.DRAFT
      });

      return ApiResponse.success(res, {
        count: result.deletedCount
      }, `Deleted ${result.deletedCount} draft entries`);
    } catch (error) {
      console.error('Bulk delete draft timesheets error:', error);
      return ApiResponse.error(res, 'Failed to bulk delete timesheets', 500);
    }
  }

  /**
   * Bulk share documents
   * POST /api/v1/bulk/documents/share
   */
  static async bulkShareDocuments(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { documentIds, userIds, canDownload } = req.body;

      if (!RequestValidator.validateTenantContext(req, res)) return;

      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return ApiResponse.validationError(res, ['Document IDs array is required']);
      }

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return ApiResponse.validationError(res, ['User IDs array is required']);
      }

      const documents = await Document.find({
        _id: { $in: documentIds },
        tenantId: req.user!.tenantId,
        userId: req.user!.userId // Owner only
      });

      if (documents.length === 0) {
        return ApiResponse.notFound(res, 'No documents found');
      }

      // Share with all specified users
      const updatePromises = documents.map(async (doc) => {
        userIds.forEach((userId: string) => {
          const alreadyShared = doc.sharedWith.some(sw => String(sw.userId) === userId);
          if (!alreadyShared) {
            doc.sharedWith.push({
              userId,
              sharedAt: new Date(),
              canDownload: canDownload ?? true
            });
          }
        });
        return doc.save();
      });

      await Promise.all(updatePromises);

      return ApiResponse.success(res, {
        documentCount: documents.length,
        userCount: userIds.length
      }, `Shared ${documents.length} documents with ${userIds.length} users`);
    } catch (error) {
      console.error('Bulk share documents error:', error);
      return ApiResponse.error(res, 'Failed to bulk share documents', 500);
    }
  }

  /**
   * Bulk update user roles (Admin only)
   * PUT /api/v1/bulk/users/roles
   */
  static async bulkUpdateUserRoles(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { userIds, role } = req.body;

      if (!RequestValidator.validateTenantContext(req, res)) return;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return ApiResponse.validationError(res, ['User IDs array is required']);
      }

      if (!role) {
        return ApiResponse.validationError(res, ['Role is required']);
      }

      // Validate role
      const roleValidation = RequestValidator.validateEnumValue(role, UserRole, 'Role');
      if (!roleValidation.valid) {
        return ApiResponse.validationError(res, [roleValidation.error!]);
      }

      const result = await User.updateMany(
        {
          _id: { $in: userIds },
          tenantId: req.user!.tenantId
        },
        { role }
      );

      return ApiResponse.success(res, {
        count: result.modifiedCount
      }, `Updated ${result.modifiedCount} users to role: ${role}`);
    } catch (error) {
      console.error('Bulk update user roles error:', error);
      return ApiResponse.error(res, 'Failed to bulk update user roles', 500);
    }
  }

  /**
   * Bulk activate/deactivate users (Admin only)
   * PUT /api/v1/bulk/users/status
   */
  static async bulkUpdateUserStatus(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { userIds, isActive } = req.body;

      if (!RequestValidator.validateTenantContext(req, res)) return;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return ApiResponse.validationError(res, ['User IDs array is required']);
      }

      if (typeof isActive !== 'boolean') {
        return ApiResponse.validationError(res, ['isActive must be a boolean']);
      }

      const result = await User.updateMany(
        {
          _id: { $in: userIds },
          tenantId: req.user!.tenantId
        },
        { isActive }
      );

      return ApiResponse.success(res, {
        count: result.modifiedCount
      }, `${isActive ? 'Activated' : 'Deactivated'} ${result.modifiedCount} users`);
    } catch (error) {
      console.error('Bulk update user status error:', error);
      return ApiResponse.error(res, 'Failed to bulk update user status', 500);
    }
  }
}

