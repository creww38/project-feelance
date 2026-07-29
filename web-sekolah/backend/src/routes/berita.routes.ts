// src/routes/berita.routes.ts
import { Router } from 'express';
import { BeritaController } from '../controllers/berita.controller';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { beritaSchema } from '../validations/berita.validation';

const router = Router();
const beritaController = new BeritaController();

// Public routes
router.get('/', beritaController.getAll);
router.get('/featured', beritaController.getFeatured);
router.get('/trending', beritaController.getTrending);
router.get('/:slug', beritaController.getBySlug);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'GURU', 'STAFF_TU'),
  validate(beritaSchema),
  beritaController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'GURU', 'STAFF_TU'),
  beritaController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  beritaController.delete
);

router.post(
  '/:id/like',
  authenticate,
  beritaController.like
);

export default router;