import { ILeaveRequestResponse } from '@shared/types/responses';
import { LeaveRequest } from '../models';
import { ILeaveRequest } from '../types';
import { Document } from 'mongoose';

/**
 * Convert LeaveRequest model to ILeaveRequestResponse
 */
export function toLeaveRequestResponse(leave: Document & ILeaveRequest): ILeaveRequestResponse {
  return {
    _id: String(leave._id),
    userId: String(leave.userId),
    leaveType: leave.leaveType,
    startDate: leave.startDate,
    endDate: leave.endDate,
    totalDays: leave.totalDays,
    isHalfDay: leave.isHalfDay,
    halfDayPeriod: leave.halfDayPeriod,
    reason: leave.reason,
    status: leave.status,
    approvedBy: leave.approvedBy ? String(leave.approvedBy) : undefined,
    rejectedBy: leave.rejectedBy ? String(leave.rejectedBy) : undefined,
    approvedAt: leave.approvedAt,
    rejectedAt: leave.rejectedAt,
    rejectionReason: leave.approvalComments,
    createdAt: leave.createdAt,
    updatedAt: leave.updatedAt
  };
}

/**
 * Convert array of LeaveRequest models to ILeaveRequestResponse[]
 */
export function toLeaveRequestResponseArray(leaves: (Document & ILeaveRequest)[]): ILeaveRequestResponse[] {
  return leaves.map(toLeaveRequestResponse);
}

