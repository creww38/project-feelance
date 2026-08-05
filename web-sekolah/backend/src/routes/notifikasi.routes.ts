import { Router } from 'express';
import { NotifikasiController } from '../controllers/notifikasi.controller';
const router = Router();
const ctrl = new NotifikasiController();
router.get('/', ctrl.getByUser);
router.put('/:id/read', ctrl.markAsRead);
export default router;