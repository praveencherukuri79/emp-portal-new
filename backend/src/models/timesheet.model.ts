import { Schema, model } from 'mongoose';
import moment from 'moment';
import { ITimesheetEntry, TimesheetStatus } from '../types';

const timesheetEntrySchema = new Schema<ITimesheetEntry>({
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

  // Date of work
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },

  // Week information (for grouping)
  weekStartDate: {
    type: Date,
    required: [true, 'Week start date is required'],
    index: true
  },
  weekEndDate: {
    type: Date,
    required: [true, 'Week end date is required']
  },
  year: {
    type: Number,
    required: true
  },
  weekNumber: {
    type: Number,
    required: true
  },

  // Project/Task details
  project: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  task: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Hours worked
  hours: {
    type: Number,
    required: [true, 'Hours are required'],
    min: [0.5, 'Minimum hours is 0.5'],
    max: [24, 'Maximum hours is 24']
  },

  // Billable status
  isBillable: {
    type: Boolean,
    default: true
  },

  // Status workflow
  status: {
    type: String,
    enum: Object.values(TimesheetStatus),
    default: TimesheetStatus.DRAFT
  },

  // Submission details
  submittedAt: Date,
  submittedBy: {
    type: String,
    ref: 'User'
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
  }

}, {
  timestamps: true
});

// Compound indexes for efficient queries
timesheetEntrySchema.index({ tenantId: 1, userId: 1, weekStartDate: 1 });
timesheetEntrySchema.index({ tenantId: 1, userId: 1, date: 1 });
timesheetEntrySchema.index({ tenantId: 1, status: 1 });
timesheetEntrySchema.index({ tenantId: 1, approvedBy: 1, status: 1 });

// Prevent duplicate entries for same user, date, and project
timesheetEntrySchema.index({ tenantId: 1, userId: 1, date: 1, project: 1 }, { unique: true });

// Calculate week number and dates before saving
timesheetEntrySchema.pre('save', function(next) {
  const date = moment(this.date);
  
  this.year = date.year();
  this.weekNumber = date.week();
  this.weekStartDate = date.clone().startOf('week').toDate();
  this.weekEndDate = date.clone().endOf('week').toDate();
  
  next();
});

export default model<ITimesheetEntry>('TimesheetEntry', timesheetEntrySchema);
