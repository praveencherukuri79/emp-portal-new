import { Router } from 'express';
import { DocumentController, upload } from '@controllers/document.controller';
import { authenticate } from '@middleware/auth.middleware';
import { authorize } from '@middleware/authorization.middleware';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload document
router.post('/upload', upload.single('file'), DocumentController.uploadDocument);

// Get documents
router.get('/my-documents', DocumentController.getMyDocuments);
router.get('/shared', DocumentController.getSharedDocuments);
router.get('/expiring', authorize(UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), DocumentController.getExpiringDocuments);
router.get('/', authorize(UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER), DocumentController.getAllDocuments);

// Document operations
router.put('/:documentId', DocumentController.updateDocument);
router.delete('/:documentId', DocumentController.deleteDocument);
router.post('/:documentId/share', DocumentController.shareDocument);
router.get('/:documentId/download', DocumentController.downloadDocument);

export default router;
