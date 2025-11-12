import { IDocumentResponse } from '@shared/types/responses';
import { Document as DocumentModel } from '../models';
import { IDocument } from '../types';
import { Document } from 'mongoose';

/**
 * Convert Document model to IDocumentResponse
 */
export function toDocumentResponse(doc: Document & IDocument): IDocumentResponse {
  return {
    _id: String(doc._id),
    userId: String(doc.userId),
    fileName: doc.fileName,
    originalName: doc.originalName,
    category: doc.category,
    description: doc.description,
    documentNumber: doc.documentNumber,
    issueDate: doc.issueDate,
    expiryDate: doc.expiryDate,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

/**
 * Convert array of Document models to IDocumentResponse[]
 */
export function toDocumentResponseArray(docs: (Document & IDocument)[]): IDocumentResponse[] {
  return docs.map(toDocumentResponse);
}

