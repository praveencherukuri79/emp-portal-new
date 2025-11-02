import { Schema, model } from 'mongoose';
import moment from 'moment';
import { ILeaveRequest, LeaveType, LeaveStatus } from '../types';

const leaveRequestSchema = new Schema<ILeaveRequest>({
  // Multi-tenant field
  tenantId: {
    type: String,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required'],
    index: true
  },

  // User reference
  userId: {
    type: String,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Leave type
  leaveType: {
    type: String,
    enum: Object.values(LeaveType),
    required: [true, 'Leave type is required']
  },

  // Date range
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    index: true
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },

  // Half-day option
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayPeriod: {
    type: String,
    enum: ['morning', 'afternoon'],
    default: null
  },

  // Total days calculated
  totalDays: {
    type: Number,
    required: true,
    min: [0.5, 'Minimum leave days is 0.5']
  },

  // Reason
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },

  // Supporting documents (optional)
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: Date
  }],

  // Status workflow
  status: {
    type: String,
    enum: Object.values(LeaveStatus),
    default: LeaveStatus.PENDING,
    index: true
  },

  // Approval details
  approvedBy: {
    type: String,
    ref: 'User'
  },
  approvedAt: Date,
  rejectedBy: {
    type: String,
    ref: 'User'
  },
  rejectedAt: Date,
  approvalComments: {
    type: String,
    maxlength: [500, 'Comments cannot exceed 500 characters']
  },

  // Cancellation
  cancelledAt: Date,
  cancellationReason: String

}, {
  timestamps: true
});

// Indexes
leaveRequestSchema.index({ tenantId: 1, userId: 1, startDate: 1 });
leaveRequestSchema.index({ tenantId: 1, status: 1 });
leaveRequestSchema.index({ tenantId: 1, leaveType: 1 });
leaveRequestSchema.index({ tenantId: 1, approvedBy: 1 });

// Calculate total days before saving
leaveRequestSchema.pre('save', function(next) {
  if (!this.isModified('startDate') && !this.isModified('endDate') && !this.isModified('isHalfDay')) {
    return next();
  }

  const start = moment(this.startDate);
  const end = moment(this.endDate);
  
  // Calculate business days
  let days = 0;
  let current = start.clone();
  
  while (current.isSameOrBefore(end)) {
    // Skip weekends (Saturday=6, Sunday=0)
    if (current.day() !== 0 && current.day() !== 6) {
      days++;
    }
    current.add(1, 'day');
  }
  
  // If half-day, divide by 2
  if (this.isHalfDay) {
    days = 0.5;
  }
  
  this.totalDays = days;
  next();
});

// Validate date range
leaveRequestSchema.pre('save', function(next) {
  if (this.startDate > this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

export default model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);
