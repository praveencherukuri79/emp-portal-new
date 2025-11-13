/**
 * Frontend Validators Utility
 * Reusable validation functions for forms and inputs
 * Uses shared validation constants for consistency
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, first } from 'rxjs';
import { PASSWORD_REQUIREMENTS, FIELD_LENGTHS, NUMERIC_RANGES } from '@shared/types/validation';

export class ValidatorsUtil {
  /**
   * Password strength validator using shared constants
   */
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }

      const hasUpperCase = PASSWORD_REQUIREMENTS.requireUppercase ? /[A-Z]/.test(value) : true;
      const hasLowerCase = PASSWORD_REQUIREMENTS.requireLowercase ? /[a-z]/.test(value) : true;
      const hasNumeric = PASSWORD_REQUIREMENTS.requireNumber ? /[0-9]/.test(value) : true;
      const hasSpecialChar = PASSWORD_REQUIREMENTS.requireSpecialChar ? /[!@#$%^&*(),.?":{}|<>]/.test(value) : true;
      const isLengthValid = value.length >= PASSWORD_REQUIREMENTS.minLength && value.length <= PASSWORD_REQUIREMENTS.maxLength;

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isLengthValid;

      if (!passwordValid) {
        return {
          strongPassword: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecialChar,
            isLengthValid,
            requirements: PASSWORD_REQUIREMENTS
          }
        };
      }

      return null;
    };
  }

  /**
   * Password match validator
   */
  static passwordMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField);
      const confirmPassword = control.get(confirmPasswordField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        confirmPassword.setErrors(null);
        return null;
      }
    };
  }

  /**
   * Date range validator
   */
  static dateRange(startDateField: string, endDateField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get(startDateField);
      const endDate = control.get(endDateField);

      if (!startDate || !endDate || !startDate.value || !endDate.value) {
        return null;
      }

      const start = new Date(startDate.value);
      const end = new Date(endDate.value);

      if (end < start) {
        endDate.setErrors({ ...endDate.errors, dateRange: true });
        return { dateRange: true };
      } else {
        if (endDate.errors) {
          delete endDate.errors['dateRange'];
          if (Object.keys(endDate.errors).length === 0) {
            endDate.setErrors(null);
          }
        }
        return null;
      }
    };
  }

  /**
   * Phone number validator
   */
  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
      const valid = phoneRegex.test(control.value);

      return valid ? null : { phone: true };
    };
  }

  /**
   * URL validator
   */
  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      try {
        new URL(control.value);
        return null;
      } catch {
        return { url: true };
      }
    };
  }

  /**
   * Numeric range validator
   */
  static numericRange(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = Number(control.value);

      if (isNaN(value)) {
        return { numeric: true };
      }

      if (value < min || value > max) {
        return { numericRange: { min, max, actual: value } };
      }

      return null;
    };
  }

  /**
   * Field length validator
   */
  static fieldLength(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const length = value.toString().length;
      if (length < min || length > max) {
        return { fieldLength: { min, max, actual: length } };
      }
      return null;
    };
  }

  /**
   * Time validation - check if hours are within valid range using shared constants
   */
  static validHours(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }
      const hours = Number(value);
      const min = NUMERIC_RANGES.TIMESHEET_HOURS.min;
      const max = NUMERIC_RANGES.TIMESHEET_HOURS.max;
      if (isNaN(hours) || hours < min || hours > max) {
        return { validHours: { min, max, actual: value } };
      }
      return null;
    };
  }

  /**
   * Name field validator (using shared constants)
   */
  static nameField(): ValidatorFn {
    return ValidatorsUtil.fieldLength(FIELD_LENGTHS.NAME.min, FIELD_LENGTHS.NAME.max);
  }

  /**
   * Email field validator (using shared constants)
   */
  static emailField(): ValidatorFn {
    return ValidatorsUtil.fieldLength(FIELD_LENGTHS.EMAIL.min, FIELD_LENGTHS.EMAIL.max);
  }

  /**
   * Reason field validator (using shared constants)
   */
  static reasonField(): ValidatorFn {
    return ValidatorsUtil.fieldLength(FIELD_LENGTHS.REASON.min, FIELD_LENGTHS.REASON.max);
  }

  /**
   * Future date validator
   */
  static futureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (inputDate < today) {
        return { futureDate: true };
      }

      return null;
    };
  }

  /**
   * Past date validator
   */
  static pastDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (inputDate > today) {
        return { pastDate: true };
      }

      return null;
    };
  }

  /**
   * File size validator
   */
  static fileSize(maxSizeInMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;

      if (!file || !file.size) {
        return null;
      }

      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        return { fileSize: { max: maxSizeInMB, actual: file.size / (1024 * 1024) } };
      }

      return null;
    };
  }

  /**
   * File type validator
   */
  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;

      if (!file || !file.type) {
        return null;
      }

      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          // Handle wildcards like 'image/*'
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType + '/');
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return { fileType: { allowed: allowedTypes, actual: file.type } };
      }

      return null;
    };
  }

  /**
   * Whitespace validator
   */
  static noWhitespace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const isWhitespace = (control.value || '').trim().length === 0;

      return isWhitespace ? { whitespace: true } : null;
    };
  }

  /**
   * Alphanumeric validator
   */
  static alphanumeric(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      const valid = alphanumericRegex.test(control.value);

      return valid ? null : { alphanumeric: true };
    };
  }

  /**
   * Employee ID format validator
   */
  static employeeIdFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      // Format: EMP00001, EMP00002, etc.
      const empIdRegex = /^[A-Z]{2,5}\d{4,6}$/;
      const valid = empIdRegex.test(control.value);

      return valid ? null : { employeeIdFormat: true };
    };
  }

  /**
   * Hours range validator (for timesheets)
   */
  static hoursRange(min: number = 0.5, max: number = 24): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = Number(control.value);

      if (isNaN(value)) {
        return { numeric: true };
      }

      if (value < min || value > max) {
        return { hoursRange: { min, max, actual: value } };
      }

      // Check if it's a multiple of 0.5
      if (value % 0.5 !== 0) {
        return { hoursIncrement: { increment: 0.5 } };
      }

      return null;
    };
  }

  /**
   * Get error message for validation error
   */
  static getErrorMessage(errors: ValidationErrors | null | undefined, fieldName: string = 'Field'): string {
    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return `${fieldName} is required`;
    }

    if (errors['email']) {
      return 'Invalid email format';
    }

    if (errors['minlength']) {
      return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    }

    if (errors['maxlength']) {
      return `${fieldName} must not exceed ${errors['maxlength'].requiredLength} characters`;
    }

    if (errors['min']) {
      return `${fieldName} must be at least ${errors['min'].min}`;
    }

    if (errors['max']) {
      return `${fieldName} must not exceed ${errors['max'].max}`;
    }

    if (errors['pattern']) {
      return `${fieldName} has invalid format`;
    }

    if (errors['strongPassword']) {
      const reqs = errors['strongPassword'];
      const missing = [];
      if (!reqs.hasUpperCase) missing.push('uppercase letter');
      if (!reqs.hasLowerCase) missing.push('lowercase letter');
      if (!reqs.hasNumeric) missing.push('number');
      if (!reqs.hasSpecialChar) missing.push('special character');
      if (!reqs.isLengthValid) missing.push('minimum 8 characters');
      return `Password must contain: ${missing.join(', ')}`;
    }

    if (errors['passwordMismatch']) {
      return 'Passwords do not match';
    }

    if (errors['dateRange']) {
      return 'End date must be after start date';
    }

    if (errors['phone']) {
      return 'Invalid phone number format';
    }

    if (errors['url']) {
      return 'Invalid URL format';
    }

    if (errors['numericRange']) {
      return `Value must be between ${errors['numericRange'].min} and ${errors['numericRange'].max}`;
    }

    if (errors['futureDate']) {
      return 'Date must be in the future';
    }

    if (errors['pastDate']) {
      return 'Date must be in the past';
    }

    if (errors['fileSize']) {
      return `File size must not exceed ${errors['fileSize'].max}MB`;
    }

    if (errors['fileType']) {
      return `File type not allowed. Allowed types: ${errors['fileType'].allowed.join(', ')}`;
    }

    if (errors['whitespace']) {
      return `${fieldName} cannot be empty or whitespace`;
    }

    if (errors['alphanumeric']) {
      return `${fieldName} must contain only letters and numbers`;
    }

    if (errors['employeeIdFormat']) {
      return 'Invalid employee ID format (e.g., EMP00001)';
    }

    if (errors['hoursRange']) {
      return `Hours must be between ${errors['hoursRange'].min} and ${errors['hoursRange'].max}`;
    }

    if (errors['hoursIncrement']) {
      return `Hours must be in increments of ${errors['hoursIncrement'].increment}`;
    }

    return 'Invalid value';
  }
}

