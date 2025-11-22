/**
 * Timesheet Model - Frontend
 * Re-exports shared types and adds frontend-specific interfaces
 */

import type { ITimesheetEntryDTO } from '@shared/types';
import { TimesheetStatus } from '@shared/types';

export type { ITimesheetEntryDTO };
export { TimesheetStatus };

export interface TimesheetEntry {
  _id?: string;
  date: Date | string;
  projectId?: string;
  project?: string;
  task?: string;
  description?: string;
  hours?: number;
  hoursWorked?: number;
  isBillable?: boolean;
  billable?: boolean;
  status?: TimesheetStatus;
}

export interface WeeklyTimesheet {
  weekStart: Date | string;
  weekEnd: Date | string;
  entries: TimesheetEntry[];
  totalHours: number;
  billableHours: number;
  status: TimesheetStatus;
  submittedAt?: Date | string;
}

export interface Project {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

