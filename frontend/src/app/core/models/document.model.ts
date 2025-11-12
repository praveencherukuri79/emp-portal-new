/**
 * Document Model - Frontend
 * Re-exports shared types and adds frontend-specific interfaces
 */

export { DocumentCategory } from '@shared/types';

export interface Document {
  _id?: string;
  fileName: string;
  originalName: string;
  category: string; // Will be DocumentCategory enum value
  description?: string;
  documentNumber?: string;
  issueDate?: Date | string;
  expiryDate?: Date | string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  isPrivate?: boolean;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
