import { Router } from 'express';
import { SiswaController } from '../controllers/siswa.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();
const siswaController = new SiswaController();

router.get('/', authenticate, authorize('ADMIN', 'GURU', 'STAFF_TU'), siswaController.getAll);
router.get('/me', authenticate, authorize('SISWA'), siswaController.getByUserId);
router.get('/stats', authenticate, authorize('ADMIN', 'KEPALA_SEKOLAH'), siswaController.getStats);
router.get('/kelas/:kelasId', authenticate, authorize('GURU', 'ADMIN'), siswaController.getByKelas);
router.get('/:id', authenticate, siswaController.getById);
router.post('/', authenticate, authorize('ADMIN', 'STAFF_TU'), siswaController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF_TU'), siswaController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), siswaController.delete);
router.post('/naik-kelas', authenticate, authorize('ADMIN'), siswaController.naikKelas);
router.post('/luluskan', authenticate, authorize('ADMIN'), siswaController.luluskan);

export default router;