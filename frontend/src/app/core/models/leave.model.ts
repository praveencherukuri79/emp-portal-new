export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity'
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum HalfDayPeriod {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  FULL_DAY = 'full_day'
}

export interface LeaveRequest {
  _id?: string;
  userId: string;
  tenantId: string;
  leaveType: LeaveType;
  startDate: Date | string;
  endDate: Date | string;
  halfDay: HalfDayPeriod;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeaveBalance {
  userId: string;
  tenantId: string;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface CreateLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  isHalfDay?: boolean;
  halfDayPeriod?: string;
  reason: string;
}

export interface ApproveRejectLeaveRequest {
  leaveId: string;
  action: 'approve' | 'reject';
  reason?: string;
}
