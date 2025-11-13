import {
  ITimesheetEntryResponse,
  IWeeklyTimesheetResponse,
  IPendingTimesheetGroupResponse
} from '@shared/types/responses';
import { TimesheetEntry } from '../models';
import { TimesheetStatus } from '@shared/types';
import { ITimesheetEntry } from '../types';
import { Document } from 'mongoose';

/**
 * Convert TimesheetEntry model to ITimesheetEntryResponse
 */
export function toTimesheetEntryResponse(entry: Document & ITimesheetEntry): ITimesheetEntryResponse {
  // Handle both string (old) and ObjectId (new) project field
  const projectValue = typeof entry.project === 'string' 
    ? entry.project 
    : (entry.project && typeof entry.project === 'object' && 'name' in entry.project)
      ? (entry.project as any).name 
      : (entry as any).projectName || String(entry.project);

  return {
    _id: String(entry._id),
    userId: String(entry.userId),
    date: entry.date,
    project: projectValue,
    projectId: typeof entry.project === 'string' ? undefined : String(entry.project),
    task: entry.task,
    description: entry.description,
    hours: entry.hours,
    hoursWorked: entry.hours,
    isBillable: entry.isBillable,
    status: entry.status,
    weekStartDate: entry.weekStartDate,
    weekEndDate: entry.weekEndDate,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  };
}

/**
 * Convert array of TimesheetEntry models to IWeeklyTimesheetResponse
 */
export function toWeeklyTimesheetResponse(
  entries: (Document & ITimesheetEntry)[],
  weekStart: Date | string,
  weekEnd: Date | string,
  status: string,
  totalHours: number,
  billableHours: number,
  nonBillableHours: number
): IWeeklyTimesheetResponse {
  return {
    weekStart,
    weekEnd,
    status: status as TimesheetStatus,
    entries: entries.map(toTimesheetEntryResponse),
    totalHours,
    billableHours,
    nonBillableHours
  };
}

/**
 * Convert grouped entries to IPendingTimesheetGroupResponse[]
 */
interface GroupedEntry {
  userId: string | { _id: string; firstName: string; lastName: string; email: string; employeeId?: string };
  weekStartDate: Date;
  weekEndDate: Date;
  entries: (Document & ITimesheetEntry)[];
  totalHours: number;
}

export function toPendingTimesheetGroupResponse(
  groupedEntries: Record<string, GroupedEntry>
): IPendingTimesheetGroupResponse[] {
  return Object.values(groupedEntries).map((group) => ({
    userId: group.userId, // Keep populated object or string as-is
    weekStartDate: group.weekStartDate,
    weekEndDate: group.weekEndDate,
    entries: group.entries.map(toTimesheetEntryResponse),
    totalHours: group.totalHours
  }));
}

