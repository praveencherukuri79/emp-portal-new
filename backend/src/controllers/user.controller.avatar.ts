/**
 * User Avatar Controller Methods
 */

import { Response } from 'express';
import { User } from '../models';
import { ApiResponse, RequestValidator } from '../utils';
import { IAuthRequest } from '../types';
import { ImageProcessor } from '../utils/image-processor.util';
import { toUserResponse } from '../dto';

export class UserAvatarController {
  /**
   * Upload avatar
   * POST /api/v1/users/avatar
   */
  static async uploadAvatar(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateUserContext(req, res)) return;

      if (!req.file) {
        return ApiResponse.validationError(res, ['No file uploaded']);
      }

      const user = await User.findById(req.user!.userId);
      
      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      // Delete old avatar if exists
      if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
        const oldFilename = path.basename(user.avatar);
        await ImageProcessor.deleteAvatar(oldFilename).catch(() => {
          // Ignore errors if file doesn't exist
        });
      }

      // Process and save new avatar
      const { url } = await ImageProcessor.processAvatar(req.file.buffer, req.file.originalname);

      // Update user
      user.avatar = url;
      await user.save();

      const responseData = toUserResponse(user);
      return ApiResponse.success(res, responseData, 'Avatar uploaded successfully');
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      return ApiResponse.error(res, error.message || 'Failed to upload avatar', 500);
    }
  }

  /**
   * Delete avatar
   * DELETE /api/v1/users/avatar
   */
  static async deleteAvatar(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!RequestValidator.validateUserContext(req, res)) return;

      const user = await User.findById(req.user!.userId);
      
      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      // Delete avatar file
      if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
        const filename = path.basename(user.avatar);
        await ImageProcessor.deleteAvatar(filename).catch(() => {
          // Ignore errors if file doesn't exist
        });
      }

      // Generate default avatar
      const initials = ImageProcessor.getInitials(user.firstName, user.lastName);
      user.avatar = ImageProcessor.generateDefaultAvatar(initials);
      await user.save();

      const responseData = toUserResponse(user);
      return ApiResponse.success(res, responseData, 'Avatar removed successfully');
    } catch (error) {
      console.error('Delete avatar error:', error);
      return ApiResponse.error(res, 'Failed to delete avatar', 500);
    }
  }

  /**
   * Get default avatar
   * GET /api/v1/users/avatar/default
   */
  static getDefaultAvatar(req: IAuthRequest, res: Response): Response {
    const { firstName, lastName } = req.query;
    
    if (!firstName || !lastName) {
      return ApiResponse.validationError(res, ['firstName and lastName are required']);
    }

    const initials = ImageProcessor.getInitials(
      String(firstName),
      String(lastName)
    );
    
    const avatar = ImageProcessor.generateDefaultAvatar(initials);
    
    return ApiResponse.success(res, { avatar }, 'Default avatar generated');
  }
}

// Import path for file operations
import path from 'path';

