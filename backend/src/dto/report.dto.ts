import {
  ITimesheetReportResponse,
  ILeaveReportResponse,
  ITeamReportResponse
} from '@shared/types/responses';
import { UserRole } from '@shared/types';
import { ITimesheetEntry, ILeaveRequest } from '../types';
import { Document } from 'mongoose';
import { toTimesheetEntryResponse } from './timesheet.dto';
import { toLeaveRequestResponse } from './leave.dto';

/**
 * Convert to ITimesheetReportResponse
 */
export function toTimesheetReportResponse(
  summary: {
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    totalEntries: number;
  },
  entries: (Document & ITimesheetEntry)[],
  dateRange: { startDate?: string; endDate?: string }
): ITimesheetReportResponse {
  return {
    summary,
    entries: entries.map(toTimesheetEntryResponse),
    dateRange
  };
}

/**
 * Convert to ILeaveReportResponse
 */
export function toLeaveReportResponse(
  summary: {
    totalLeaves: number;
    totalDays: number;
    approved: number;
    pending: number;
    rejected: number;
    byType: Record<string, { count: number; totalDays: number }>;
  },
  leaves: (Document & ILeaveRequest)[],
  dateRange: { startDate?: string; endDate?: string }
): ILeaveReportResponse {
  return {
    summary,
    leaves: leaves.map(toLeaveRequestResponse),
    dateRange
  };
}

/**
 * Convert to ITeamReportResponse
 */
export function toTeamReportResponse(
  teamSize: number,
  teamMembers: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      employeeId?: string;
      role: string | UserRole;
    };
    timesheetSummary: {
      totalHours: number;
      billableHours: number;
      entriesCount: number;
    };
    leaveSummary: {
      totalLeaves: number;
      totalDays: number;
      pending: number;
    };
  }>
): ITeamReportResponse {
  return {
    teamSize,
    teamMembers: teamMembers.map(member => ({
      ...member,
      user: {
        ...member.user,
        role: member.user.role as UserRole
      }
    }))
  };
}

