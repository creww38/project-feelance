// src/routes/pesan.routes.ts
import { Router } from 'express';
import { PesanController } from '../controllers/pesan.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const pesanController = new PesanController();

router.get('/conversations', authenticate, pesanController.getConversations);
router.get('/:partnerId', authenticate, pesanController.getMessages);
router.post('/', authenticate, pesanController.sendMessage);
router.put('/:pesanId/read', authenticate, pesanController.markAsRead);
router.get('/unread/count', authenticate, pesanController.getUnreadCount);

export default router;