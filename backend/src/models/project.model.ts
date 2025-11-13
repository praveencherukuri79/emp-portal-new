import { Schema, model, Document } from 'mongoose';

export interface IProject extends Document {
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  clientName?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  isActive: boolean;
  assignedUsers: string[]; // Array of user IDs assigned to this project
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  // Multi-tenant field
  tenantId: {
    type: String,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required'],
    index: true
  },

  // Project details
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Project code is required'],
    trim: true,
    uppercase: true,
    maxlength: [20, 'Project code cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Client information
  clientName: {
    type: String,
    trim: true
  },

  // Project timeline
  startDate: Date,
  endDate: Date,

  // Budget
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold', 'cancelled'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Team assignment
  assignedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]

}, {
  timestamps: true
});

// Indexes
projectSchema.index({ tenantId: 1, code: 1 }, { unique: true });
projectSchema.index({ tenantId: 1, isActive: 1 });
projectSchema.index({ tenantId: 1, status: 1 });
projectSchema.index({ assignedUsers: 1 }); // For quick lookup of user's projects

export const Project = model<IProject>('Project', projectSchema);
export default Project;

