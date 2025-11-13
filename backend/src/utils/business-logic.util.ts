/**
 * Business Logic Utility
 * Common business logic functions shared across services
 */

import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { LeaveType, ILeaveBalance } from '@shared/types';

dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);

export class BusinessLogic {
  /**
   * Calculate working days between two dates (excluding weekends)
   */
  static calculateWorkingDays(startDate: Date | string, endDate: Date | string, excludeWeekends: boolean = true): number {
    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).startOf('day');
    let workingDays = 0;
    let current = start;

    while (current.isSameOrBefore(end, 'day')) {
      const dayOfWeek = current.day();
      
      if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        workingDays++;
      }
      
      current = current.add(1, 'day');
    }

    return workingDays;
  }

  /**
   * Calculate week start and end dates for a given date
   */
  static getWeekDates(date: Date | string): {
    weekStart: Date;
    weekEnd: Date;
    year: number;
    weekNumber: number;
  } {
    const d = dayjs(date);
    const weekStart = d.startOf('isoWeek').toDate(); // Monday
    const weekEnd = d.endOf('isoWeek').toDate(); // Sunday
    const year = d.year();
    const weekNumber = d.isoWeek();

    return {
      weekStart,
      weekEnd,
      year,
      weekNumber
    };
  }

  /**
   * Check if leave balance is sufficient
   */
  static hasSufficientLeaveBalance(
    leaveBalance: ILeaveBalance,
    leaveType: LeaveType,
    requestedDays: number
  ): {
    sufficient: boolean;
    available: number;
    error?: string;
  } {
    const balanceKey = leaveType as keyof ILeaveBalance;
    const available = leaveBalance[balanceKey];

    if (available < requestedDays) {
      return {
        sufficient: false,
        available,
        error: `Insufficient leave balance. Available: ${available} days, Requested: ${requestedDays} days`
      };
    }

    return {
      sufficient: true,
      available
    };
  }

  /**
   * Deduct leave from balance
   */
  static deductLeaveBalance(
    leaveBalance: ILeaveBalance,
    leaveType: LeaveType,
    days: number
  ): ILeaveBalance {
    const balanceKey = leaveType as keyof ILeaveBalance;
    const updatedBalance = { ...leaveBalance };
    updatedBalance[balanceKey] = Math.max(0, leaveBalance[balanceKey] - days);
    return updatedBalance;
  }

  /**
   * Restore leave to balance (when leave is cancelled/rejected)
   */
  static restoreLeaveBalance(
    leaveBalance: ILeaveBalance,
    leaveType: LeaveType,
    days: number
  ): ILeaveBalance {
    const balanceKey = leaveType as keyof ILeaveBalance;
    const updatedBalance = { ...leaveBalance };
    updatedBalance[balanceKey] = leaveBalance[balanceKey] + days;
    return updatedBalance;
  }

  /**
   * Calculate billable percentage
   */
  static calculateBillablePercentage(billableHours: number, totalHours: number): number {
    if (totalHours === 0) return 0;
    return Math.round((billableHours / totalHours) * 100);
  }

  /**
   * Calculate utilization rate
   */
  static calculateUtilizationRate(
    actualHours: number,
    availableHours: number
  ): number {
    if (availableHours === 0) return 0;
    return Math.round((actualHours / availableHours) * 100);
  }

  /**
   * Check if date is within range
   */
  static isDateInRange(
    date: Date | string,
    rangeStart: Date | string,
    rangeEnd: Date | string
  ): boolean {
    const d = dayjs(date);
    const start = dayjs(rangeStart);
    const end = dayjs(rangeEnd);
    return d.isSameOrAfter(start, 'day') && d.isSameOrBefore(end, 'day');
  }

  /**
   * Check if two date ranges overlap
   */
  static doDateRangesOverlap(
    range1Start: Date | string,
    range1End: Date | string,
    range2Start: Date | string,
    range2End: Date | string
  ): boolean {
    const r1Start = dayjs(range1Start);
    const r1End = dayjs(range1End);
    const r2Start = dayjs(range2Start);
    const r2End = dayjs(range2End);

    return r1Start.isSameOrBefore(r2End, 'day') && r2Start.isSameOrBefore(r1End, 'day');
  }

  /**
   * Calculate age from date of birth
   */
  static calculateAge(dateOfBirth: Date | string): number {
    const dob = dayjs(dateOfBirth);
    const now = dayjs();
    return now.diff(dob, 'year');
  }

  /**
   * Get days until expiry
   */
  static getDaysUntilExpiry(expiryDate: Date | string): number {
    const expiry = dayjs(expiryDate);
    const now = dayjs();
    return expiry.diff(now, 'day');
  }

  /**
   * Check if document is expiring soon
   */
  static isDocumentExpiringSoon(expiryDate: Date | string, daysThreshold: number = 30): boolean {
    const daysUntilExpiry = this.getDaysUntilExpiry(expiryDate);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= daysThreshold;
  }

  /**
   * Check if document is expired
   */
  static isDocumentExpired(expiryDate: Date | string): boolean {
    return dayjs(expiryDate).isBefore(dayjs(), 'day');
  }

  /**
   * Format full name
   */
  static formatFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`.trim();
  }

  /**
   * Generate employee ID
   */
  static generateEmployeeId(prefix: string = 'EMP', sequence: number): string {
    return `${prefix}${sequence.toString().padStart(5, '0')}`;
  }

  /**
   * Calculate tenure in months
   */
  static calculateTenureMonths(joiningDate: Date | string): number {
    const joining = dayjs(joiningDate);
    const now = dayjs();
    return now.diff(joining, 'month');
  }

  /**
   * Group array by key
   */
  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {} as Record<string, T[]>);
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(value: number, total: number, decimals: number = 2): number {
    if (total === 0) return 0;
    return Number(((value / total) * 100).toFixed(decimals));
  }

  /**
   * Calculate sum of array values
   */
  static sum(array: number[]): number {
    return array.reduce((acc, val) => acc + val, 0);
  }

  /**
   * Calculate average of array values
   */
  static average(array: number[]): number {
    if (array.length === 0) return 0;
    return this.sum(array) / array.length;
  }

  /**
   * Get month range
   */
  static getMonthRange(date?: Date | string): {
    startDate: Date;
    endDate: Date;
  } {
    const d = date ? dayjs(date) : dayjs();
    return {
      startDate: d.startOf('month').toDate(),
      endDate: d.endOf('month').toDate()
    };
  }

  /**
   * Get quarter range
   */
  static getQuarterRange(date?: Date | string): {
    startDate: Date;
    endDate: Date;
  } {
    const d = date ? dayjs(date) : dayjs();
    return {
      startDate: d.startOf('quarter').toDate(),
      endDate: d.endOf('quarter').toDate()
    };
  }

  /**
   * Get year range
   */
  static getYearRange(date?: Date | string): {
    startDate: Date;
    endDate: Date;
  } {
    const d = date ? dayjs(date) : dayjs();
    return {
      startDate: d.startOf('year').toDate(),
      endDate: d.endOf('year').toDate()
    };
  }

  /**
   * Parse period string to date range
   */
  static parsePeriodToDateRange(period: 'month' | 'quarter' | 'year'): {
    startDate: Date;
    endDate: Date;
  } {
    switch (period) {
      case 'month':
        return this.getMonthRange();
      case 'quarter':
        return this.getQuarterRange();
      case 'year':
        return this.getYearRange();
      default:
        return this.getMonthRange();
    }
  }

  /**
   * Check if current user can approve for a specific user
   */
  static canApprove(approverId: string, requestorId: string, reportingTo?: string): boolean {
    // Can't approve own requests
    if (approverId === requestorId) {
      return false;
    }

    // Can approve if the approver is the reporting manager
    return approverId === reportingTo;
  }

  /**
   * Validate hours range for timesheet
   */
  static validateTimesheetHours(hours: number): {
    valid: boolean;
    error?: string;
  } {
    if (hours < 0.5) {
      return { valid: false, error: 'Minimum hours is 0.5' };
    }
    if (hours > 24) {
      return { valid: false, error: 'Maximum hours is 24' };
    }
    return { valid: true };
  }

  /**
   * Calculate week total hours
   */
  static calculateWeekTotalHours(entries: Array<{ hours: number }>): {
    total: number;
    billable: number;
    nonBillable: number;
  } {
    const result = entries.reduce(
      (acc, entry) => {
        acc.total += entry.hours;
        if ('isBillable' in entry && (entry as any).isBillable) {
          acc.billable += entry.hours;
        } else {
          acc.nonBillable += entry.hours;
        }
        return acc;
      },
      { total: 0, billable: 0, nonBillable: 0 }
    );

    return {
      total: Number(result.total.toFixed(2)),
      billable: Number(result.billable.toFixed(2)),
      nonBillable: Number(result.nonBillable.toFixed(2))
    };
  }
}

