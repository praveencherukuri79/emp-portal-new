/**
 * Reusable Validation Utilities
 * Common validation functions used across the application
 */

export class ValidationUtil {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (basic validation)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * Validate URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate MongoDB ObjectId
   */
  static isValidObjectId(id: string): boolean {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }

  /**
   * Validate file extension
   */
  static isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  /**
   * Validate file size
   */
  static isValidFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }

  /**
   * Validate date range
   */
  static isValidDateRange(startDate: Date, endDate: Date): boolean {
    return new Date(startDate) <= new Date(endDate);
  }

  /**
   * Validate hours (for timesheet)
   */
  static isValidHours(hours: number): boolean {
    return hours >= 0.5 && hours <= 24;
  }

  /**
   * Sanitize string (remove special characters)
   */
  static sanitizeString(input: string): string {
    return input.replace(/[<>\"']/g, '');
  }

  /**
   * Validate and sanitize pagination parameters
   */
  static sanitizePagination(page?: number, limit?: number): { page: number; limit: number } {
    const sanitizedPage = Math.max(1, page || 1);
    const sanitizedLimit = Math.min(100, Math.max(1, limit || 10));

    return {
      page: sanitizedPage,
      limit: sanitizedLimit
    };
  }

  /**
   * Validate tenant domain
   */
  static isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    return domain.length >= 3 && domain.length <= 50 && domainRegex.test(domain);
  }

  /**
   * Validate employee ID format
   */
  static isValidEmployeeId(employeeId: string): boolean {
    const employeeIdRegex = /^[A-Z0-9-]+$/;
    return employeeId.length >= 3 && employeeId.length <= 20 && employeeIdRegex.test(employeeId);
  }
}
