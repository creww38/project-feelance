// src/routes/upload.routes.ts
import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.middleware';

const router = Router();
const uploadController = new UploadController();

router.post('/image', authenticate, uploadSingle('image'), uploadController.uploadImage);
router.post('/document', authenticate, uploadSingle('document'), uploadController.uploadDocument);
router.post('/multiple', authenticate, uploadMultiple('files', 10), uploadController.uploadMultiple);
router.post('/avatar', authenticate, uploadSingle('avatar'), uploadController.uploadAvatar);
router.delete('/:publicId', authenticate, uploadController.deleteFile);

export default router;