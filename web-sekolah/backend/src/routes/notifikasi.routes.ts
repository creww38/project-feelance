// src/routes/notifikasi.routes.ts
import { Router } from 'express';
import { NotifikasiController } from '../controllers/notifikasi.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const notifikasiController = new NotifikasiController();

router.get('/', authenticate, notifikasiController.getByUser);
router.get('/unread/count', authenticate, notifikasiController.getUnreadCount);
router.put('/:id/read', authenticate, notifikasiController.markAsRead);
router.put('/read/all', authenticate, notifikasiController.markAllAsRead);

export default router;