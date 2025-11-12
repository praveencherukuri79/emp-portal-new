/**
 * Approval Model - Frontend
 * Re-exports shared types and adds frontend-specific interfaces
 */

export {
  ApprovalType,
  ApprovalStatus,
  IApprovalRequest,
  ITimesheetApprovalData,
  ILeaveApprovalData,
  IBulkApprovalRequest
} from '@shared/types';

// Frontend-specific interfaces can extend shared types if needed
export interface ApprovalRequest extends IApprovalRequest {}
export interface TimesheetApprovalData extends ITimesheetApprovalData {}
export interface LeaveApprovalData extends ILeaveApprovalData {}
export interface BulkApprovalRequest extends IBulkApprovalRequest {}
