import { Router } from 'express';
import { DocumentController, upload } from '@controllers/document.controller';
import { authenticate } from '@middleware/auth.middleware';
import { authorize } from '@middleware/authorization.middleware';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload document (EMPLOYER should NOT upload documents directly)
router.post('/upload', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN), upload.single('file'), DocumentController.uploadDocument);

// Get documents
router.get('/my-documents', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN), DocumentController.getMyDocuments);
router.get('/shared', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), DocumentController.getSharedDocuments);
router.get('/expiring', authorize(UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), DocumentController.getExpiringDocuments);
router.get('/', authorize(UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), DocumentController.getAllDocuments);

// Document operations
router.put('/:documentId', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN), DocumentController.updateDocument);
router.delete('/:documentId', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN), DocumentController.deleteDocument);
router.post('/:documentId/share', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN), DocumentController.shareDocument);
router.get('/:documentId/download', authorize(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), DocumentController.downloadDocument);

export default router;
