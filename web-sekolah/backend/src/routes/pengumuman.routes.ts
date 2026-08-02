import { Router } from 'express';
import { PengumumanController } from '../controllers/pengumuman.controller';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();
const pengumumanController = new PengumumanController();

// Public routes
router.get('/', optionalAuth, pengumumanController.getAll);
router.get('/:id', optionalAuth, pengumumanController.getById);

// Protected routes
router.post('/', authenticate, pengumumanController.create);

export default router;