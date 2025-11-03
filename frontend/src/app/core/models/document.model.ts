export enum DocumentCategory {
  PASSPORT = 'passport',
  VISA = 'visa',
  DRIVING_LICENSE = 'driving_license',
  ID_CARD = 'id_card',
  CONTRACT = 'contract',
  CERTIFICATE = 'certificate',
  OTHER = 'other'
}

export enum DocumentStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring_soon'
}

export interface Document {
  _id?: string;
  userId: string;
  tenantId: string;
  category: DocumentCategory;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  issueDate?: Date | string;
  expiryDate?: Date | string;
  status?: DocumentStatus;
  notes?: string;
  uploadedAt?: Date | string;
  updatedAt?: Date | string;
}

export interface DocumentUploadRequest {
  category: DocumentCategory;
  title: string;
  file: File;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
}

export interface DocumentFilters {
  category?: DocumentCategory;
  status?: DocumentStatus;
  search?: string;
}
