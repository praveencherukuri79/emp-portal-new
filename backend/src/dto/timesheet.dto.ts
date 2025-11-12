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
  return {
    _id: String(entry._id),
    userId: String(entry.userId),
    date: entry.date,
    project: entry.project,
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
  userId: string | { _id: string };
  weekStartDate: Date;
  weekEndDate: Date;
  entries: (Document & ITimesheetEntry)[];
  totalHours: number;
}

export function toPendingTimesheetGroupResponse(
  groupedEntries: Record<string, GroupedEntry>
): IPendingTimesheetGroupResponse[] {
  return Object.values(groupedEntries).map((group) => ({
    userId: typeof group.userId === 'string' ? group.userId : String(group.userId._id),
    weekStartDate: group.weekStartDate,
    weekEndDate: group.weekEndDate,
    entries: group.entries.map(toTimesheetEntryResponse),
    totalHours: group.totalHours
  }));
}

