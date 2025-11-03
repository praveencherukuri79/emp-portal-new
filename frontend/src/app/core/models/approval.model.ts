export enum ApprovalType {
  TIMESHEET = 'timesheet',
  LEAVE = 'leave'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface ApprovalRequest {
  _id?: string;
  type: ApprovalType;
  requestId: string;
  requestorId: string;
  requestorName: string;
  approverId: string;
  approverName?: string;
  tenantId: string;
  status: ApprovalStatus;
  requestData: any;
  submittedAt: Date | string;
  reviewedAt?: Date | string;
  comments?: string;
  rejectionReason?: string;
}

export interface TimesheetApprovalData {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  billableHours: number;
  entries: number;
}

export interface LeaveApprovalData {
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
}

export interface BulkApprovalRequest {
  approvalIds: string[];
  status: 'approved' | 'rejected';
  comments?: string;
}
