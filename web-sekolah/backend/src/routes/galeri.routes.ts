import { Router } from 'express';
import { GaleriController } from '../controllers/galeri.controller';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();
const galeriController = new GaleriController();

// Public routes
router.get('/', optionalAuth, galeriController.getAll);
router.get('/:id', optionalAuth, galeriController.getById);

// Protected routes
router.post('/', authenticate, galeriController.create);

export default router;