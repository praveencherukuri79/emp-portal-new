import {
  IEmployeeDashboardResponse,
  ISupervisorDashboardResponse,
  IHRDashboardResponse
} from '@shared/types/responses';
import { ILeaveBalance } from '@shared/types';
import { ILeaveRequest, IDocument } from '../types';
import { Document } from 'mongoose';
import { toLeaveRequestResponse } from './leave.dto';
import { toDocumentResponse } from './document.dto';

/**
 * Convert to IEmployeeDashboardResponse
 */
export function toEmployeeDashboardResponse(
  timesheet: {
    monthHours: number;
    monthBillable: number;
    weekStatus: string;
  },
  leaveBalance: ILeaveBalance,
  upcomingLeaves: (Document & ILeaveRequest)[],
  expiringDocuments: (Document & IDocument)[],
  pendingApprovals: number
): IEmployeeDashboardResponse {
  return {
    timesheet,
    leave: {
      balance: leaveBalance,
      upcoming: upcomingLeaves.map(toLeaveRequestResponse)
    },
    documents: {
      expiring: expiringDocuments.length,
      expiringList: expiringDocuments.map(toDocumentResponse)
    },
    quickActions: [
      { label: 'Submit Timesheet', route: '/timesheet' },
      { label: 'Request Leave', route: '/leave/request' },
      { label: 'Upload Document', route: '/documents/upload' }
    ],
    pendingApprovals
  };
}

/**
 * Convert to ISupervisorDashboardResponse
 */
export function toSupervisorDashboardResponse(
  team: {
    size: number;
    active: number;
  },
  approvals: {
    timesheets: number;
    leaves: number;
    leaveRequests: (Document & ILeaveRequest)[];
  },
  teamPerformance: Array<{
    userId: string;
    totalHours: number;
    billableHours: number;
  }>,
  quickActions: Array<{ label: string; route: string }>
): ISupervisorDashboardResponse {
  return {
    team,
    approvals: {
      timesheets: approvals.timesheets,
      leaves: approvals.leaves,
      leaveRequests: approvals.leaveRequests.map(toLeaveRequestResponse)
    },
    teamPerformance,
    quickActions
  };
}

/**
 * Convert to IHRDashboardResponse
 */
export function toHRDashboardResponse(
  employees: {
    total: number;
    newHires: number;
    onLeaveToday: number;
  },
  leaves: {
    pending: number;
    approved: number;
    rejected: number;
  },
  expiringDocuments: (Document & IDocument)[],
  quickActions: Array<{ label: string; route: string }>
): IHRDashboardResponse {
  return {
    employees,
    leaves,
    documents: {
      expiring: expiringDocuments.length,
      expiringList: expiringDocuments.map(toDocumentResponse)
    },
    quickActions
  };
}

