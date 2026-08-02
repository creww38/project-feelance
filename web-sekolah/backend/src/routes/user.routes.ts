import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

// Profile routes (all authenticated users)
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// Admin routes
router.get('/', authenticate, userController.getAll);
router.get('/:id', authenticate, userController.getById);

export default router;