import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { uploadSingle } from '../middlewares/upload.middleware';
const router = Router();
const ctrl = new UploadController();
router.post('/image', uploadSingle('file'), ctrl.uploadImage);
export default router;