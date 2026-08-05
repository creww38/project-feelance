import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/', userController.getAll);
router.get('/stats', userController.getStats);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;