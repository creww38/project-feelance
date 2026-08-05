import { Router } from 'express';
import { GuruController } from '../controllers/guru.controller';
const router = Router();
const ctrl = new GuruController();
router.get('/', ctrl.getAll);
router.get('/stats', ctrl.getStats);
router.get('/me', ctrl.getByUserId);
router.get('/:id', ctrl.getById);
export default router;