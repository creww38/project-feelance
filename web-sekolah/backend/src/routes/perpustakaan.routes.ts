import { Router } from 'express';
import { PerpustakaanController } from '../controllers/perpustakaan.controller';
const router = Router();
const ctrl = new PerpustakaanController();
router.get('/', ctrl.getBuku);
router.get('/:id', ctrl.getBukuById);
export default router;