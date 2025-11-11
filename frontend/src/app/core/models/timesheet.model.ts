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
  _id?: string;
  weekStart: Date | string;
  weekEnd: Date | string;
  entries: TimesheetEntry[];
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  status: TimesheetStatus;
  userId?: string;
  employeeName?: string;
  submittedAt?: Date | string;
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
