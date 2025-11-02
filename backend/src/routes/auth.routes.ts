import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, ValidationRules } from '../middleware/validation.middleware';
import { body } from 'express-validator';

const router = Router();

/**
 * Authentication Routes
 * Base path: /api/v1/auth
 */

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  validate([
    ValidationRules.email,
    ValidationRules.password,
    ValidationRules.firstName,
    ValidationRules.lastName,
    ValidationRules.tenantDomain
  ]),
  AuthController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validate([
    ValidationRules.email,
    body('password').trim().notEmpty().withMessage('Password is required'),
    ValidationRules.tenantDomain
  ]),
  AuthController.login
);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh-token',
  validate([
    body('refreshToken').trim().notEmpty().withMessage('Refresh token is required')
  ]),
  AuthController.refreshToken
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  validate([
    ValidationRules.email,
    ValidationRules.tenantDomain
  ]),
  AuthController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  validate([
    body('token').trim().notEmpty().withMessage('Reset token is required'),
    ValidationRules.password
  ]),
  AuthController.resetPassword
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  AuthController.getMe
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password (authenticated user)
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validate([
    body('currentPassword').trim().notEmpty().withMessage('Current password is required'),
    body('newPassword').custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
    ValidationRules.password.withMessage('New password does not meet requirements')
  ]),
  AuthController.changePassword
);

export default router;
