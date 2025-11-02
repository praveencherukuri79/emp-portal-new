import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Document } from '../models';
import { ApiResponse } from '@utils/response.util';
import { IAuthRequest, DocumentCategory, UserRole } from '../types';
import moment from 'moment';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, Word, and Excel files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export class DocumentController {
  /**
   * Upload document
   */
  static async uploadDocument(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.file) {
        return ApiResponse.error(res, 'No file uploaded', 400);
        return;
      }

      const { category, description, documentNumber, issueDate, expiryDate } = req.body;

      const document = new Document({
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        category: category || DocumentCategory.OTHER,
        description,
        documentNumber,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined
      });

      await document.save();

      return ApiResponse.created(res, document, 'Document uploaded successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to upload document', 500);
    }
  }

  /**
   * Get my documents
   */
  static async getMyDocuments(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { category, expiringSoon } = req.query as any;

      const query: any = {
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        isActive: true
      };

      if (category) query.category = category;

      if (expiringSoon === 'true') {
        const thirtyDaysFromNow = moment().add(30, 'days').toDate();
        query.expiryDate = {
          $gte: new Date(),
          $lte: thirtyDaysFromNow
        };
      }

      const documents = await Document.find(query).sort({ createdAt: -1 });

      return ApiResponse.success(res, documents, 'Documents retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve documents', 500);
    }
  }

  /**
   * Get all documents (HR/Admin/Employer)
   */
  static async getAllDocuments(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { userId, category, expiringSoon } = req.query as any;

      const query: any = {
        tenantId: req.user?.tenantId,
        isActive: true
      };

      if (userId) query.userId = userId;
      if (category) query.category = category;

      if (expiringSoon === 'true') {
        const thirtyDaysFromNow = moment().add(30, 'days').toDate();
        query.expiryDate = {
          $gte: new Date(),
          $lte: thirtyDaysFromNow
        };
      }

      const documents = await Document.find(query)
        .populate('userId', 'firstName lastName email employeeId')
        .sort({ createdAt: -1 });

      return ApiResponse.success(res, documents, 'Documents retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve documents', 500);
    }
  }

  /**
   * Get expiring documents (HR/Admin/Employer)
   */
  static async getExpiringDocuments(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const thirtyDaysFromNow = moment().add(30, 'days').toDate();

      const documents = await Document.find({
        tenantId: req.user?.tenantId,
        expiryDate: {
          $gte: new Date(),
          $lte: thirtyDaysFromNow
        },
        isActive: true
      })
        .populate('userId', 'firstName lastName email employeeId')
        .sort({ expiryDate: 1 });

      // Categorize by urgency
      const categorized = {
        critical: documents.filter(d => d.expiryDate && moment(d.expiryDate).diff(moment(), 'days') <= 7),
        warning: documents.filter(d => d.expiryDate && moment(d.expiryDate).diff(moment(), 'days') > 7 && moment(d.expiryDate).diff(moment(), 'days') <= 15),
        notice: documents.filter(d => d.expiryDate && moment(d.expiryDate).diff(moment(), 'days') > 15)
      };

      return ApiResponse.success(res, categorized, 'Expiring documents retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve expiring documents', 500);
    }
  }

  /**
   * Share document
   */
  static async shareDocument(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { documentId } = req.params;
      const { userIds, canDownload } = req.body;

      const document = await Document.findOne({
        _id: documentId,
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      });

      if (!document) {
        return ApiResponse.notFound(res, 'Document not found');
        return;
      }

      const sharedWith = userIds.map((userId: string) => ({
        userId,
        sharedAt: new Date(),
        canDownload: canDownload ?? true
      }));

      document.sharedWith = [...document.sharedWith, ...sharedWith];
      await document.save();

      return ApiResponse.success(res, document, 'Document shared successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to share document', 500);
    }
  }

  /**
   * Download document
   */
  static async downloadDocument(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { documentId } = req.params;

      const document = await Document.findOne({
        _id: documentId,
        tenantId: req.user?.tenantId
      });

      if (!document) {
        return ApiResponse.notFound(res, 'Document not found');
        return;
      }

      // Check access rights
      const isOwner = document.userId.toString() === req.user?.userId;
      const isSharedWithUser = document.sharedWith.some(
        (share: any) => share.userId.toString() === req.user?.userId
      );
      const isHROrAdmin = [UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER].includes(req.user?.role as UserRole);

      if (!isOwner && !isSharedWithUser && !isHROrAdmin) {
        return ApiResponse.forbidden(res, 'Access denied');
        return;
      }

      res.download(document.filePath, document.originalName);
    } catch (error) {
      return ApiResponse.error(res, 'Failed to download document', 500);
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { documentId } = req.params;

      const document = await Document.findOne({
        _id: documentId,
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      });

      if (!document) {
        return ApiResponse.notFound(res, 'Document not found');
        return;
      }

      // Mark as inactive instead of deleting
      document.isActive = false;
      await document.save();

      return ApiResponse.success(res, null, 'Document deleted successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to delete document', 500);
    }
  }

  /**
   * Update document metadata
   */
  static async updateDocument(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { documentId } = req.params;
      const { category, description, documentNumber, issueDate, expiryDate } = req.body;

      const document = await Document.findOne({
        _id: documentId,
        tenantId: req.user?.tenantId,
        userId: req.user?.userId
      });

      if (!document) {
        return ApiResponse.notFound(res, 'Document not found');
        return;
      }

      if (category) document.category = category;
      if (description) document.description = description;
      if (documentNumber) document.documentNumber = documentNumber;
      if (issueDate) document.issueDate = new Date(issueDate);
      if (expiryDate) document.expiryDate = new Date(expiryDate);

      await document.save();

      return ApiResponse.success(res, document, 'Document updated successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to update document', 500);
    }
  }

  /**
   * Get shared documents
   */
  static async getSharedDocuments(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const documents = await Document.find({
        tenantId: req.user?.tenantId,
        'sharedWith.userId': req.user?.userId,
        isActive: true
      })
        .populate('userId', 'firstName lastName email employeeId')
        .sort({ createdAt: -1 });

      return ApiResponse.success(res, documents, 'Shared documents retrieved successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to retrieve shared documents', 500);
    }
  }
}




