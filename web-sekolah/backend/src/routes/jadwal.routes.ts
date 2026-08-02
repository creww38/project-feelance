import { Router } from 'express';
import { JadwalController } from '../controllers/jadwal.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();
const jadwalController = new JadwalController();

router.get('/', authenticate, jadwalController.getAll);
router.get('/kelas/:kelasId', authenticate, jadwalController.getByKelas);
router.get('/guru/:guruId', authenticate, jadwalController.getByGuru);
router.get('/:id', authenticate, jadwalController.getById);
router.post('/', authenticate, authorize('ADMIN', 'STAFF_TU'), jadwalController.create);
router.post('/bulk', authenticate, authorize('ADMIN', 'STAFF_TU'), jadwalController.createMany);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF_TU'), jadwalController.update);
router.delete('/:id', authenticate, authorize('ADMIN', 'STAFF_TU'), jadwalController.delete);

export default router;