/**
 * Leave Model - Frontend
 * Re-exports shared types and adds frontend-specific interfaces
 */

// Import enums as values for use in this file
import { LeaveType, LeaveStatus } from '@shared/types';
// Re-export enums
export { LeaveType, LeaveStatus } from '@shared/types';

// Import types
import type { ILeaveRequestDTO } from '@shared/types';
export type { ILeaveRequestDTO } from '@shared/types';

export interface LeaveRequest extends ILeaveRequestDTO {
  _id?: string;
  status?: LeaveStatus;
  totalDays?: number;
  startDate: Date | string;
  endDate: Date | string;
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

