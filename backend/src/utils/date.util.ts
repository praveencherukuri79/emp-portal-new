import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with plugins
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

/**
 * Reusable Date Utilities
 * Handles date calculations, formatting, and validation
 */

export class DateUtil {
  /**
   * Get start of week (Monday)
   */
  static getWeekStart(date: Date = new Date()): Date {
    return dayjs(date).startOf('isoWeek').toDate();
  }

  /**
   * Get end of week (Sunday)
   */
  static getWeekEnd(date: Date = new Date()): Date {
    return dayjs(date).endOf('isoWeek').toDate();
  }

  /**
   * Get week number
   */
  static getWeekNumber(date: Date = new Date()): number {
    return dayjs(date).isoWeek();
  }

  /**
   * Get year
   */
  static getYear(date: Date = new Date()): number {
    return dayjs(date).year();
  }

  /**
   * Calculate business days between two dates (excluding weekends)
   */
  static calculateBusinessDays(startDate: Date, endDate: Date): number {
    let days = 0;
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isSameOrBefore(end, 'day')) {
      // Skip Saturday (6) and Sunday (0)
      if (current.day() !== 0 && current.day() !== 6) {
        days++;
      }
      current = current.add(1, 'day');
    }

    return days;
  }

  /**
   * Check if date is weekend
   */
  static isWeekend(date: Date): boolean {
    const day = dayjs(date).day();
    return day === 0 || day === 6;
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date): boolean {
    return dayjs(date).isBefore(dayjs(), 'day');
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date): boolean {
    return dayjs(date).isAfter(dayjs(), 'day');
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    return dayjs(date).isSame(dayjs(), 'day');
  }

  /**
   * Format date
   */
  static format(date: Date, format: string = 'YYYY-MM-DD'): string {
    return dayjs(date).format(format);
  }

  /**
   * Parse date string
   */
  static parse(dateString: string, format: string = 'YYYY-MM-DD'): Date {
    return dayjs(dateString, format).toDate();
  }

  /**
   * Add days to date
   */
  static addDays(date: Date, days: number): Date {
    return dayjs(date).add(days, 'days').toDate();
  }

  /**
   * Subtract days from date
   */
  static subtractDays(date: Date, days: number): Date {
    return dayjs(date).subtract(days, 'days').toDate();
  }

  /**
   * Get days until expiry
   */
  static getDaysUntilExpiry(expiryDate: Date): number {
    return dayjs(expiryDate).diff(dayjs(), 'days');
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
    const start = dayjs(this.getWeekStart(date));

    for (let i = 0; i < 7; i++) {
      dates.push(start.add(i, 'days').toDate());
    }

    return dates;
  }

  /**
   * Validate date range
   */
  static isValidDateRange(startDate: Date, endDate: Date): boolean {
    return dayjs(startDate).isSameOrBefore(dayjs(endDate));
  }
}
