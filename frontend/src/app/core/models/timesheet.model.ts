export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface TimesheetEntry {
  _id?: string;
  userId: string;
  tenantId: string;
  date: Date | string;
  projectId: string;
  projectName?: string;
  hours: number;
  description: string;
  billable: boolean;
  status: TimesheetStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WeeklyTimesheet {
  weekStart: Date;
  weekEnd: Date;
  entries: TimesheetEntry[];
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  status: TimesheetStatus;
}

export interface Project {
  _id: string;
  tenantId: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface CreateTimesheetRequest {
  date: string;
  projectId: string;
  hours: number;
  description: string;
  billable: boolean;
}

export interface UpdateTimesheetRequest extends Partial<CreateTimesheetRequest> {
  _id: string;
}

export interface SubmitWeekRequest {
  weekStart: string;
  weekEnd: string;
  entryIds: string[];
}
