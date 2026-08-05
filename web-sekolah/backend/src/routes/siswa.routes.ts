import { Router } from 'express';
import { SiswaController } from '../controllers/siswa.controller';
const router = Router();
const ctrl = new SiswaController();
router.get('/', ctrl.getAll);
router.get('/me', ctrl.getByUserId);
router.get('/:id', ctrl.getById);
export default router;