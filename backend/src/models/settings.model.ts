/**
 * Settings Model
 * System and organization settings
 */

import { Schema, model, Document } from 'mongoose';

export interface IHoliday {
  name: string;
  date: Date;
  isRecurring: boolean;
}

export interface IDepartment {
  _id?: string;
  name: string;
  code: string;
  managerId?: string;
  isActive: boolean;
}

export interface IWorkingHours {
  startTime: string; // HH:mm format
  endTime: string;
  breakDuration: number; // minutes
  workingDaysPerWeek: number;
}

export interface ILeavePolicy {
  leaveType: string;
  annualAllocation: number;
  accrualRate: number; // per month
  maxCarryOver: number;
  allowNegativeBalance: boolean;
  requiresApproval: boolean;
}

export interface IOrganizationSettings extends Document {
  tenantId: string;
  
  // Organization details
  organizationName: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logo?: string;
  
  // Working hours
  workingHours: IWorkingHours;
  
  // Holidays
  holidays: IHoliday[];
  
  // Departments
  departments: IDepartment[];
  
  // Leave policies
  leavePolicies: ILeavePolicy[];
  
  // Email settings
  emailSettings: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail?: string;
    fromName?: string;
  };
  
  // Notification preferences
  notificationSettings: {
    emailNotificationsEnabled: boolean;
    inAppNotificationsEnabled: boolean;
    notifyOnTimesheetSubmission: boolean;
    notifyOnLeaveRequest: boolean;
    notifyOnApproval: boolean;
  };
  
  // Other settings
  fiscalYearStart: number; // Month (1-12)
  currency: string;
  dateFormat: string;
  timeFormat: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const organizationSettingsSchema = new Schema<IOrganizationSettings>({
  tenantId: {
    type: String,
    ref: 'Tenant',
    required: true,
    unique: true,
    index: true
  },
  
  organizationName: {
    type: String,
    required: true
  },
  
  address: String,
  contactEmail: String,
  contactPhone: String,
  logo: String,
  
  workingHours: {
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    breakDuration: { type: Number, default: 60 },
    workingDaysPerWeek: { type: Number, default: 5 }
  },
  
  holidays: [{
    name: String,
    date: Date,
    isRecurring: { type: Boolean, default: false }
  }],
  
  departments: [{
    name: String,
    code: String,
    managerId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true }
  }],
  
  leavePolicies: [{
    leaveType: String,
    annualAllocation: Number,
    accrualRate: Number,
    maxCarryOver: Number,
    allowNegativeBalance: { type: Boolean, default: false },
    requiresApproval: { type: Boolean, default: true }
  }],
  
  emailSettings: {
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPassword: String,
    fromEmail: String,
    fromName: String
  },
  
  notificationSettings: {
    emailNotificationsEnabled: { type: Boolean, default: true },
    inAppNotificationsEnabled: { type: Boolean, default: true },
    notifyOnTimesheetSubmission: { type: Boolean, default: true },
    notifyOnLeaveRequest: { type: Boolean, default: true },
    notifyOnApproval: { type: Boolean, default: true }
  },
  
  fiscalYearStart: { type: Number, default: 1 }, // January
  currency: { type: String, default: 'USD' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  timeFormat: { type: String, default: '12h' }
  
}, {
  timestamps: true
});

export const OrganizationSettings = model<IOrganizationSettings>('OrganizationSettings', organizationSettingsSchema);
export default OrganizationSettings;

