import { Router } from 'express';
import { PesanController } from '../controllers/pesan.controller';
const router = Router();
const ctrl = new PesanController();
router.get('/conversations', ctrl.getConversations);
router.post('/', ctrl.sendMessage);
export default router;