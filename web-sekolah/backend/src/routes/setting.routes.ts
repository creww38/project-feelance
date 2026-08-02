import { Router } from 'express';
import { SettingController } from '../controllers/setting.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();
const settingController = new SettingController();

router.get('/public', settingController.getPublic);
router.get('/', authenticate, authorize('ADMIN'), settingController.getAll);
router.get('/:key', authenticate, authorize('ADMIN'), settingController.getByKey);
router.put('/:id', authenticate, authorize('ADMIN'), settingController.update);
router.post('/set', authenticate, authorize('ADMIN'), settingController.set);

export default router;