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
 * Common validation rules using shared constants
 */
import { body, param, query } from 'express-validator';
import { PASSWORD_REQUIREMENTS, FIELD_LENGTHS, NUMERIC_RANGES } from '@shared/types/validation';

export const ValidationRules = {
  // User validation
  email: body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .isLength({ min: FIELD_LENGTHS.EMAIL.min, max: FIELD_LENGTHS.EMAIL.max })
    .withMessage(`Email must be ${FIELD_LENGTHS.EMAIL.min}-${FIELD_LENGTHS.EMAIL.max} characters`)
    .normalizeEmail(),

  password: body('password')
    .trim()
    .isLength({ min: PASSWORD_REQUIREMENTS.minLength, max: PASSWORD_REQUIREMENTS.maxLength })
    .withMessage(`Password must be ${PASSWORD_REQUIREMENTS.minLength}-${PASSWORD_REQUIREMENTS.maxLength} characters`)
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),

  firstName: body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: FIELD_LENGTHS.NAME.min, max: FIELD_LENGTHS.NAME.max })
    .withMessage(`First name must be ${FIELD_LENGTHS.NAME.min}-${FIELD_LENGTHS.NAME.max} characters`),

  lastName: body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: FIELD_LENGTHS.NAME.min, max: FIELD_LENGTHS.NAME.max })
    .withMessage(`Last name must be ${FIELD_LENGTHS.NAME.min}-${FIELD_LENGTHS.NAME.max} characters`),

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
    .isFloat({ min: NUMERIC_RANGES.TIMESHEET_HOURS.min, max: NUMERIC_RANGES.TIMESHEET_HOURS.max })
    .withMessage(`Hours must be between ${NUMERIC_RANGES.TIMESHEET_HOURS.min} and ${NUMERIC_RANGES.TIMESHEET_HOURS.max}`),

  timesheetProject: body('project')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: FIELD_LENGTHS.PROJECT_NAME.min, max: FIELD_LENGTHS.PROJECT_NAME.max })
    .withMessage(`Project name must be ${FIELD_LENGTHS.PROJECT_NAME.min}-${FIELD_LENGTHS.PROJECT_NAME.max} characters`),

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
    .isLength({ min: FIELD_LENGTHS.REASON.min, max: FIELD_LENGTHS.REASON.max })
    .withMessage(`Reason must be ${FIELD_LENGTHS.REASON.min}-${FIELD_LENGTHS.REASON.max} characters`),

  // Pagination validation  
  paginationPage: query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  paginationLimit: query('limit')
    .optional()
    .isInt({ min: 1, max: NUMERIC_RANGES.TIMESHEET_HOURS.max })
    .withMessage(`Limit must be between 1 and ${NUMERIC_RANGES.TIMESHEET_HOURS.max}`),

  // Status validation
  status: (field: string, allowedValues: string[]) => body(field)
    .optional()
    .isIn(allowedValues).withMessage(`Invalid ${field}`)
};
