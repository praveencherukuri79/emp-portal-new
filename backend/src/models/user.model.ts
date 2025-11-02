import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { IUser, UserRole, EmploymentType, Gender, VisaStatus } from '../types';

const userSchema = new Schema<IUser>({
  // Multi-tenant field
  tenantId: {
    type: String,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required'],
    index: true
  },

  // Authentication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastPasswordChange: Date,

  // Role-based access
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.EMPLOYEE,
    required: true
  },

  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: Object.values(Gender)
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },

  // Address
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  // Employee Information
  employeeId: {
    type: String,
    sparse: true,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  joiningDate: Date,
  employmentType: {
    type: String,
    enum: Object.values(EmploymentType),
    default: EmploymentType.FULL_TIME
  },
  salary: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  reportingTo: {
    type: String,
    ref: 'User',
    default: null
  },

  // Visa Information
  visa: {
    type: {
      type: String,
      trim: true
    },
    number: {
      type: String,
      trim: true
    },
    expiryDate: Date,
    status: {
      type: String,
      enum: Object.values(VisaStatus),
      default: VisaStatus.NOT_APPLICABLE
    }
  },

  // Leave Balance
  leaveBalance: {
    annual: { type: Number, default: 20 },
    sick: { type: Number, default: 10 },
    personal: { type: Number, default: 5 },
    unpaid: { type: Number, default: 0 },
    maternity: { type: Number, default: 0 },
    paternity: { type: Number, default: 0 }
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  lastLogin: Date,

  // Refresh Token for JWT
  refreshToken: String

}, {
  timestamps: true
});

// Indexes for multi-tenant queries
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, employeeId: 1 });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ tenantId: 1, department: 1 });
userSchema.index({ tenantId: 1, reportingTo: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_ROUNDS || '10'));
  this.lastPasswordChange = new Date();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || '15') * 60 * 1000);
  
  return resetToken;
};

// Exclude sensitive fields from JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.refreshToken;
  delete obj.emailVerificationToken;
  return obj;
};

export default model<IUser>('User', userSchema);
