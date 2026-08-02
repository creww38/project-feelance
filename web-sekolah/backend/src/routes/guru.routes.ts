import { Router } from 'express';
import { GuruController } from '../controllers/guru.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();
const guruController = new GuruController();

router.get('/', authenticate, authorize('ADMIN', 'KEPALA_SEKOLAH'), guruController.getAll);
router.get('/me', authenticate, authorize('GURU'), guruController.getByUserId);
router.get('/stats', authenticate, authorize('ADMIN', 'KEPALA_SEKOLAH'), guruController.getStats);
router.get('/:id', authenticate, guruController.getById);
router.post('/', authenticate, authorize('ADMIN'), guruController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'GURU'), guruController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), guruController.delete);

export default router;