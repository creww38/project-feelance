import { Router } from 'express';
import { PPDBController } from '../controllers/ppdb.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const ppdbController = new PPDBController();

// Public routes
router.post('/', ppdbController.create);
router.get('/check/:noPendaftaran', ppdbController.getByNoPendaftaran);

// Protected routes (Admin/Staff)
router.get('/', authenticate, ppdbController.getAll);
router.put('/:id/verify', authenticate, ppdbController.verify);

export default router;