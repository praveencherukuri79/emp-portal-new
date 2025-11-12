import { Request, Response } from 'express';
import User from '../models/user.model';
import Tenant from '../models/tenant.model';
import { ApiResponse, TokenUtil, PasswordUtil, EmailUtil } from '../utils';
import { IRegisterDTO, ILoginDTO, IPasswordResetRequestDTO, IPasswordResetDTO, IAuthRequest } from '../types';
import { IChangePasswordRequest, IRefreshTokenRequest } from '@shared/types/requests';

/**
 * Authentication Controller
 * Handles user registration, login, password reset, and token refresh
 */

export class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   * Single-tenant deployment - automatically uses the single tenant in the database
   */
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, firstName, lastName }: IRegisterDTO = req.body;

      // Single-tenant deployment - get the only tenant in the database
      const tenant = await Tenant.findOne({ isActive: true });
      if (!tenant) {
        return ApiResponse.error(res, 'Organization not configured. Please contact administrator.', 500);
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email, tenantId: tenant._id });
      if (existingUser) {
        return ApiResponse.error(res, 'User already exists with this email', 400);
      }

      // Validate password strength
      const passwordValidation = PasswordUtil.validate(password);
      if (!passwordValidation.valid) {
        return ApiResponse.validationError(res, passwordValidation.errors);
      }

      // Create new user
      const user = new User({
        tenantId: tenant._id,
        email,
        password,
        firstName,
        lastName,
        role: 'employee', // Default role
        isActive: true,
        isEmailVerified: false
      });

      await user.save();

      // Generate tokens
      const tokens = TokenUtil.generateTokens({
        userId: String(user._id),
        tenantId: String(tenant._id),
        role: user.role,
        email: user.email
      });

      // Save refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      // Send welcome email (optional)
      // await EmailUtil.sendWelcomeEmail(user.email, user.fullName, 'Please login');

      return ApiResponse.created(res, {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }, 'Registration successful');

    } catch (error: any) {
      console.error('Register error:', error);
      return ApiResponse.error(res, error.message || 'Registration failed', 500);
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   * Single-tenant deployment - automatically uses the single tenant in the database
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password }: ILoginDTO = req.body;

      // Single-tenant deployment - get the only tenant in the database
      const tenant = await Tenant.findOne({ isActive: true });
      if (!tenant) {
        return ApiResponse.error(res, 'Organization not configured. Please contact administrator.', 500);
      }

      // Find user with password field
      const user = await User.findOne({ email, tenantId: tenant._id }).select('+password');
      if (!user) {
        return ApiResponse.unauthorized(res, 'Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        return ApiResponse.unauthorized(res, 'Account is inactive. Contact administrator');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return ApiResponse.unauthorized(res, 'Invalid credentials');
      }

      // Generate tokens
      const tokens = TokenUtil.generateTokens({
        userId: String(user._id),
        tenantId: String(tenant._id),
        role: user.role,
        email: user.email
      });

      // Update user
      user.refreshToken = tokens.refreshToken;
      user.lastLogin = new Date();
      await user.save();

      return ApiResponse.success(res, {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }, 'Login successful');

    } catch (error: any) {
      console.error('Login error:', error);
      return ApiResponse.error(res, error.message || 'Login failed', 500);
    }
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  static async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken }: IRefreshTokenRequest = req.body;

      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token is required', 400);
      }

      // Verify refresh token
      const decoded = TokenUtil.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return ApiResponse.unauthorized(res, 'Invalid refresh token');
      }

      // Generate new tokens
      const tokens = TokenUtil.generateTokens({
        userId: String(user._id),
        tenantId: user.tenantId,
        role: user.role,
        email: user.email
      });

      // Update refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return ApiResponse.success(res, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }, 'Token refreshed successfully');

    } catch (error: any) {
      console.error('Refresh token error:', error);
      return ApiResponse.unauthorized(res, 'Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  static async logout(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // Clear refresh token
      await User.findByIdAndUpdate(req.user.userId, { refreshToken: null });

      return ApiResponse.success(res, null, 'Logout successful');

    } catch (error: any) {
      console.error('Logout error:', error);
      return ApiResponse.error(res, error.message || 'Logout failed', 500);
    }
  }

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   * Single-tenant deployment - automatically uses the single tenant in the database
   */
  static async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email }: IPasswordResetRequestDTO = req.body;

      // Single-tenant deployment - get the only tenant in the database
      const tenant = await Tenant.findOne({ isActive: true });
      if (!tenant) {
        // Don't reveal configuration issues
        return ApiResponse.success(res, null, 'If the email exists, a reset link has been sent');
      }

      // Find user
      const user = await User.findOne({ email, tenantId: tenant._id });
      if (!user) {
        // Don't reveal if user exists or not (security)
        return ApiResponse.success(res, null, 'If the email exists, a reset link has been sent');
      }

      // Generate reset token
      const resetToken = user.createPasswordResetToken();
      await user.save();

      // Send email
      const emailSent = await EmailUtil.sendPasswordReset(
        user.email,
        resetToken,
        user.fullName
      );

      if (!emailSent) {
        return ApiResponse.error(res, 'Failed to send reset email', 500);
      }

      return ApiResponse.success(res, null, 'Password reset link sent to your email');

    } catch (error: any) {
      console.error('Forgot password error:', error);
      return ApiResponse.error(res, error.message || 'Failed to process request', 500);
    }
  }

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  static async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token, newPassword }: IPasswordResetDTO = req.body;

      // Validate new password
      const passwordValidation = PasswordUtil.validate(newPassword);
      if (!passwordValidation.valid) {
        return ApiResponse.validationError(res, passwordValidation.errors);
      }

      // Hash token
      const hashedToken = PasswordUtil.hashResetToken(token);

      // Find user with valid reset token
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return ApiResponse.error(res, 'Invalid or expired reset token', 400);
      }

      // Update password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.refreshToken = undefined; // Invalidate all sessions
      await user.save();

      return ApiResponse.success(res, null, 'Password reset successful. Please login with new password');

    } catch (error: any) {
      console.error('Reset password error:', error);
      return ApiResponse.error(res, error.message || 'Password reset failed', 500);
    }
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  static async getMe(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const user = await User.findById(req.user.userId)
        .populate('reportingTo', 'firstName lastName email');

      if (!user) {
        return ApiResponse.notFound(res, 'User');
      }

      return ApiResponse.success(res, user, 'User profile retrieved');

    } catch (error: any) {
      console.error('Get me error:', error);
      return ApiResponse.error(res, error.message || 'Failed to get profile', 500);
    }
  }

  /**
   * Change password (authenticated user)
   * POST /api/v1/auth/change-password
   */
  static async changePassword(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const { currentPassword, newPassword }: IChangePasswordRequest = req.body;

      // Get user with password
      const user = await User.findById(req.user.userId).select('+password');
      if (!user) {
        return ApiResponse.notFound(res, 'User');
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return ApiResponse.error(res, 'Current password is incorrect', 400);
      }

      // Validate new password
      const passwordValidation = PasswordUtil.validate(newPassword);
      if (!passwordValidation.valid) {
        return ApiResponse.validationError(res, passwordValidation.errors);
      }

      // Update password
      user.password = newPassword;
      user.refreshToken = undefined; // Invalidate all sessions
      await user.save();

      return ApiResponse.success(res, null, 'Password changed successfully. Please login again');

    } catch (error: any) {
      console.error('Change password error:', error);
      return ApiResponse.error(res, error.message || 'Password change failed', 500);
    }
  }
}

export default AuthController;
