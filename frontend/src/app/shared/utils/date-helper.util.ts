/**
 * Date Helper Utility
 * Common date operations and formatting using DayJs
 */

import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

// Load plugins
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(quarterOfYear);

export class DateHelper {
  /**
   * Format date to YYYY-MM-DD
   */
  static formatDate(date: Date | string): string {
    return dayjs(date).format('YYYY-MM-DD');
  }

  /**
   * Format date to display format (e.g., "Jan 15, 2024")
   */
  static formatDateDisplay(date: Date | string): string {
    return dayjs(date).format('MMM DD, YYYY');
  }

  /**
   * Format date and time for display
   */
  static formatDateTime(date: Date | string): string {
    return dayjs(date).format('MMM DD, YYYY HH:mm');
  }

  /**
   * Get relative time string (e.g., "2 hours ago")
   */
  static getRelativeTime(date: Date | string): string {
    return dayjs(date).fromNow();
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date | string): boolean {
    return dayjs(date).isSame(dayjs(), 'day');
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date | string): boolean {
    return dayjs(date).isBefore(dayjs(), 'day');
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date | string): boolean {
    return dayjs(date).isAfter(dayjs(), 'day');
  }

  /**
   * Get week start (Monday)
   */
  static getWeekStart(date?: Date | string): Date {
    return dayjs(date).startOf('isoWeek').toDate();
  }

  /**
   * Get week end (Sunday)
   */
  static getWeekEnd(date?: Date | string): Date {
    return dayjs(date).endOf('isoWeek').toDate();
  }

  /**
   * Get month start
   */
  static getMonthStart(date?: Date | string): Date {
    return dayjs(date).startOf('month').toDate();
  }

  /**
   * Get month end
   */
  static getMonthEnd(date?: Date | string): Date {
    return dayjs(date).endOf('month').toDate();
  }

  /**
   * Calculate working days between two dates (excluding weekends)
   */
  static getWorkingDays(startDate: Date | string, endDate: Date | string): number {
    let current = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).startOf('day');
    let count = 0;

    while (current.isSameOrBefore(end, 'day')) {
      const dayOfWeek = current.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current = current.add(1, 'day');
    }

    return count;
  }

  /**
   * Add days to date
   */
  static addDays(date: Date | string, days: number): Date {
    return dayjs(date).add(days, 'day').toDate();
  }

  /**
   * Add months to date
   */
  static addMonths(date: Date | string, months: number): Date {
    return dayjs(date).add(months, 'month').toDate();
  }

  /**
   * Get days difference between two dates
   */
  static getDaysDifference(date1: Date | string, date2: Date | string): number {
    return Math.abs(dayjs(date2).diff(dayjs(date1), 'day'));
  }

  /**
   * Get days until date
   */
  static getDaysUntil(date: Date | string): number {
    return dayjs(date).diff(dayjs(), 'day');
  }

  /**
   * Check if date is weekend
   */
  static isWeekend(date: Date | string): boolean {
    const day = dayjs(date).day();
    return day === 0 || day === 6;
  }

  /**
   * Get age from date of birth
   */
  static getAge(dateOfBirth: Date | string): number {
    return dayjs().diff(dayjs(dateOfBirth), 'year');
  }

  /**
   * Get all dates in a week
   */
  static getWeekDates(startDate?: Date | string): Date[] {
    const start = startDate ? dayjs(startDate) : dayjs().startOf('isoWeek');
    const dates: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      dates.push(start.add(i, 'day').toDate());
    }
    
    return dates;
  }

  /**
   * Format time duration (e.g., "2h 30m")
   */
  static formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    
    if (h === 0) {
      return `${m}m`;
    } else if (m === 0) {
      return `${h}h`;
    } else {
      return `${h}h ${m}m`;
    }
  }

  /**
   * Parse date string to Date object safely
   */
  static parseDate(dateString: string | Date): Date | null {
    if (dateString instanceof Date) {
      return dateString;
    }
    
    const parsed = dayjs(dateString);
    return parsed.isValid() ? parsed.toDate() : null;
  }

  /**
   * Get date range as array
   */
  static getDateRange(startDate: Date | string, endDate: Date | string): Date[] {
    let current = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).startOf('day');
    const dates: Date[] = [];

    while (current.isSameOrBefore(end, 'day')) {
      dates.push(current.toDate());
      current = current.add(1, 'day');
    }

    return dates;
  }

  /**
   * Get current quarter
   */
  static getCurrentQuarter(): number {
    return dayjs().quarter();
  }

  /**
   * Get quarter start and end dates
   */
  static getQuarterDates(quarter: number, year?: number): { start: Date; end: Date } {
    const y = year || dayjs().year();
    const date = dayjs().year(y).quarter(quarter);
    return {
      start: date.startOf('quarter').toDate(),
      end: date.endOf('quarter').toDate()
    };
  }
}

