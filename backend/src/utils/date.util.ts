import moment from 'moment';

/**
 * Reusable Date Utilities
 * Handles date calculations, formatting, and validation
 */

export class DateUtil {
  /**
   * Get start of week (Monday)
   */
  static getWeekStart(date: Date = new Date()): Date {
    return moment(date).startOf('week').toDate();
  }

  /**
   * Get end of week (Sunday)
   */
  static getWeekEnd(date: Date = new Date()): Date {
    return moment(date).endOf('week').toDate();
  }

  /**
   * Get week number
   */
  static getWeekNumber(date: Date = new Date()): number {
    return moment(date).week();
  }

  /**
   * Get year
   */
  static getYear(date: Date = new Date()): number {
    return moment(date).year();
  }

  /**
   * Calculate business days between two dates (excluding weekends)
   */
  static calculateBusinessDays(startDate: Date, endDate: Date): number {
    let days = 0;
    const current = moment(startDate);
    const end = moment(endDate);

    while (current.isSameOrBefore(end, 'day')) {
      // Skip Saturday (6) and Sunday (0)
      if (current.day() !== 0 && current.day() !== 6) {
        days++;
      }
      current.add(1, 'day');
    }

    return days;
  }

  /**
   * Check if date is weekend
   */
  static isWeekend(date: Date): boolean {
    const day = moment(date).day();
    return day === 0 || day === 6;
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date): boolean {
    return moment(date).isBefore(moment(), 'day');
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date): boolean {
    return moment(date).isAfter(moment(), 'day');
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    return moment(date).isSame(moment(), 'day');
  }

  /**
   * Format date
   */
  static format(date: Date, format: string = 'YYYY-MM-DD'): string {
    return moment(date).format(format);
  }

  /**
   * Parse date string
   */
  static parse(dateString: string, format: string = 'YYYY-MM-DD'): Date {
    return moment(dateString, format).toDate();
  }

  /**
   * Add days to date
   */
  static addDays(date: Date, days: number): Date {
    return moment(date).add(days, 'days').toDate();
  }

  /**
   * Subtract days from date
   */
  static subtractDays(date: Date, days: number): Date {
    return moment(date).subtract(days, 'days').toDate();
  }

  /**
   * Get days until expiry
   */
  static getDaysUntilExpiry(expiryDate: Date): number {
    return moment(expiryDate).diff(moment(), 'days');
  }

  /**
   * Check if document is expiring soon
   */
  static isExpiringSoon(expiryDate: Date, days: number = 30): boolean {
    const daysUntil = this.getDaysUntilExpiry(expiryDate);
    return daysUntil >= 0 && daysUntil <= days;
  }

  /**
   * Get date range for a week
   */
  static getWeekDateRange(date: Date = new Date()): { start: Date; end: Date } {
    return {
      start: this.getWeekStart(date),
      end: this.getWeekEnd(date)
    };
  }

  /**
   * Get all dates in a week
   */
  static getWeekDates(date: Date = new Date()): Date[] {
    const dates: Date[] = [];
    const start = moment(this.getWeekStart(date));

    for (let i = 0; i < 7; i++) {
      dates.push(start.clone().add(i, 'days').toDate());
    }

    return dates;
  }

  /**
   * Validate date range
   */
  static isValidDateRange(startDate: Date, endDate: Date): boolean {
    return moment(startDate).isSameOrBefore(moment(endDate));
  }
}
