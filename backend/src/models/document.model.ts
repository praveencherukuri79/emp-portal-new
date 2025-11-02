import { Schema, model } from 'mongoose';
import { IDocument, DocumentCategory } from '../types';

const documentSchema = new Schema<IDocument>({
  // Multi-tenant field
  tenantId: {
    type: String,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required'],
    index: true
  },

  // Owner
  userId: {
    type: String,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Document details
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },

  // Category
  category: {
    type: String,
    enum: Object.values(DocumentCategory),
    required: [true, 'Category is required'],
    index: true
  },

  // Document metadata
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  documentNumber: {
    type: String,
    trim: true
  },
  issueDate: Date,
  expiryDate: {
    type: Date,
    index: true
  },

  // Sharing
  sharedWith: [{
    userId: {
      type: String,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    canDownload: {
      type: Boolean,
      default: true
    }
  }],

  // Access control
  isPrivate: {
    type: Boolean,
    default: true
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Expiry notifications sent
  expiryNotificationSent: {
    thirtyDays: { type: Boolean, default: false },
    fifteenDays: { type: Boolean, default: false },
    sevenDays: { type: Boolean, default: false }
  },

  // Virus scan (optional)
  scanStatus: {
    type: String,
    enum: ['pending', 'clean', 'infected', 'not-scanned'],
    default: 'not-scanned'
  },
  scannedAt: Date

}, {
  timestamps: true
});

// Indexes
documentSchema.index({ tenantId: 1, userId: 1, category: 1 });
documentSchema.index({ tenantId: 1, expiryDate: 1 });
documentSchema.index({ tenantId: 1, category: 1, expiryDate: 1 });
documentSchema.index({ 'sharedWith.userId': 1 });

export default model<IDocument>('Document', documentSchema);
