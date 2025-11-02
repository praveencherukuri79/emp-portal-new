import { Schema, model } from 'mongoose';
import { ITenant } from '../types';

const tenantSchema = new Schema<ITenant>({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  settings: {
    workDaysPerWeek: {
      type: Number,
      default: 5
    },
    workHoursPerDay: {
      type: Number,
      default: 8
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD'
    },
    timeZone: {
      type: String,
      default: 'UTC'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['trial', 'basic', 'premium', 'enterprise'],
      default: 'trial'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    maxUsers: {
      type: Number,
      default: 10
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
tenantSchema.index({ domain: 1 });
tenantSchema.index({ isActive: 1 });

export default model<ITenant>('Tenant', tenantSchema);
