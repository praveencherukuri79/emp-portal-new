import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiResponse } from '../utils';

/**
 * Validation Middleware
 * Handles request validation using express-validator
 */

/**
 * Process validation results
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return ApiResponse.validationError(res, errorMessages);
    }

    next();
  };
};

/**
 * Common validation rules
 */
import { body, param, query } from 'express-validator';

export const ValidationRules = {
  // User validation
  email: body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),

  password: body('password')
    .trim()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),

  firstName: body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),

  lastName: body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),

  // Single-tenant deployment - tenantDomain validation removed

  // MongoDB ObjectId validation
  objectId: (field: string = 'id') => param(field)
    .trim()
    .isMongoId().withMessage(`Invalid ${field}`),

  // Timesheet validation
  timesheetDate: body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),

  timesheetHours: body('hours')
    .notEmpty().withMessage('Hours are required')
    .isFloat({ min: 0.5, max: 24 }).withMessage('Hours must be between 0.5 and 24'),

  timesheetProject: body('project')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Project name must be 2-100 characters'),

  // Leave validation
  leaveType: body('leaveType')
    .notEmpty().withMessage('Leave type is required')
    .isIn(['annual', 'sick', 'personal', 'unpaid', 'maternity', 'paternity'])
    .withMessage('Invalid leave type'),

  leaveStartDate: body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format'),

  leaveEndDate: body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  leaveReason: body('reason')
    .trim()
    .notEmpty().withMessage('Reason is required')
    .isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters'),

  // Pagination validation
  paginationPage: query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  paginationLimit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  // Status validation
  status: (field: string, allowedValues: string[]) => body(field)
    .optional()
    .isIn(allowedValues).withMessage(`Invalid ${field}`)
};
