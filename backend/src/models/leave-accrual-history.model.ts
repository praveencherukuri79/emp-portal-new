/**
 * Leave Accrual History Model
 * Tracks leave accrual transactions
 */

import { Schema, model, Document } from 'mongoose';
import { LeaveType } from '@shared/types';

export interface ILeaveAccrualHistory extends Document {
  tenantId: string;
  userId: string;
  leaveType: LeaveType;
  amount: number;
  reason: string; // e.g., "Monthly accrual", "Annual reset", "Manual adjustment"
  balance: {
    before: number;
    after: number;
  };
  accrualDate: Date;
  fiscalYear: number;
  createdBy?: string; // For manual adjustments
  createdAt: Date;
  updatedAt: Date;
}

const leaveAccrualHistorySchema = new Schema<ILeaveAccrualHistory>({
  tenantId: {
    type: String,
    ref: 'Tenant',
    required: true,
    index: true
  },
  
  userId: {
    type: String,
    ref: 'User',
    required: true,
    index: true
  },
  
  leaveType: {
    type: String,
    enum: Object.values(LeaveType),
    required: true
  },
  
  amount: {
    type: Number,
    required: true
  },
  
  reason: {
    type: String,
    required: true
  },
  
  balance: {
    before: { type: Number, required: true },
    after: { type: Number, required: true }
  },
  
  accrualDate: {
    type: Date,
    required: true,
    index: true
  },
  
  fiscalYear: {
    type: Number,
    required: true
  },
  
  createdBy: {
    type: String,
    ref: 'User'
  }
  
}, {
  timestamps: true
});

// Indexes
leaveAccrualHistorySchema.index({ tenantId: 1, userId: 1, accrualDate: -1 });
leaveAccrualHistorySchema.index({ tenantId: 1, fiscalYear: 1 });

export const LeaveAccrualHistory = model<ILeaveAccrualHistory>('LeaveAccrualHistory', leaveAccrualHistorySchema);
export default LeaveAccrualHistory;

