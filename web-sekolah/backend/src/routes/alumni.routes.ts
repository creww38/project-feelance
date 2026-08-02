import { Router } from 'express';
import { AlumniController } from '../controllers/alumni.controller';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();
const alumniController = new AlumniController();

router.get('/', optionalAuth, alumniController.getAll);
router.get('/stats', authenticate, authorize('ADMIN', 'KEPALA_SEKOLAH'), alumniController.getStats);
router.get('/:id', optionalAuth, alumniController.getById);
router.post('/', authenticate, authorize('ADMIN', 'STAFF_TU'), alumniController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF_TU'), alumniController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), alumniController.delete);
router.post('/:id/tracer', authenticate, authorize('ADMIN', 'STAFF_TU'), alumniController.addTracerStudy);

export default router;