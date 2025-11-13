/**
 * Shared Validation Utility Functions
 * Common validation functions used by both frontend and backend
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate phone number (basic)
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check if it has 10-15 digits
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date
 */
export function isValidDate(date: any): boolean {
  if (!date) {
    return false;
  }
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: Date | string, endDate: Date | string): { valid: boolean; error?: string } {
  if (!isValidDate(startDate)) {
    return { valid: false, error: 'Invalid start date' };
  }
  
  if (!isValidDate(endDate)) {
    return { valid: false, error: 'Invalid end date' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return { valid: false, error: 'Start date must be before end date' };
  }
  
  return { valid: true };
}

/**
 * Validate number range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate string length
 */
export function isValidLength(str: string, min: number, max: number): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  return str.length >= min && str.length <= max;
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  return true;
}

/**
 * Validate alphanumeric
 */
export function isAlphanumeric(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Validate alphabetic only
 */
export function isAlphabetic(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  return /^[a-zA-Z]+$/.test(str);
}

/**
 * Validate numeric only
 */
export function isNumeric(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  return /^[0-9]+$/.test(str);
}

/**
 * Validate decimal number
 */
export function isDecimal(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  return /^-?\d+(\.\d+)?$/.test(str);
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validate non-negative number
 */
export function isNonNegativeNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Validate integer
 */
export function isInteger(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && Number.isInteger(value);
}

/**
 * Validate file size
 */
export function isValidFileSize(sizeInBytes: number, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes > 0 && sizeInBytes <= maxSizeInBytes;
}

/**
 * Validate file extension
 */
export function isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
  if (!filename || !allowedExtensions || allowedExtensions.length === 0) {
    return false;
  }
  
  const extension = filename.toLowerCase().split('.').pop();
  if (!extension) {
    return false;
  }
  
  return allowedExtensions.some(ext => ext.toLowerCase().replace('.', '') === extension);
}

/**
 * Validate MIME type
 */
export function isValidMimeType(mimeType: string, allowedTypes: string[]): boolean {
  if (!mimeType || !allowedTypes || allowedTypes.length === 0) {
    return false;
  }
  
  return allowedTypes.includes(mimeType);
}

/**
 * Sanitize string (remove special characters)
 */
export function sanitizeString(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.replace(/[^a-zA-Z0-9\s-_]/g, '');
}

/**
 * Validate username
 */
export function isValidUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }
  
  const trimmed = username.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (trimmed.length > 30) {
    return { valid: false, error: 'Username must be less than 30 characters' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
  }
  
  return { valid: true };
}

/**
 * Validate employee ID
 */
export function isValidEmployeeId(employeeId: string): boolean {
  if (!employeeId || typeof employeeId !== 'string') {
    return false;
  }
  
  // Allow alphanumeric with hyphens and underscores, 3-20 characters
  return /^[a-zA-Z0-9_-]{3,20}$/.test(employeeId.trim());
}

/**
 * Validate age (must be 18+)
 */
export function isValidAge(birthdate: Date | string, minAge: number = 18): boolean {
  if (!isValidDate(birthdate)) {
    return false;
  }
  
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= minAge;
}

/**
 * Validate array not empty
 */
export function isNonEmptyArray(arr: any[]): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Validate object not empty
 */
export function isNonEmptyObject(obj: object): boolean {
  return obj !== null && typeof obj === 'object' && Object.keys(obj).length > 0;
}

