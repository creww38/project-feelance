import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

// Verify token
router.get('/verify', authenticate, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Token valid',
    data: {
      user: {
        id: (req as any).user?.id,
        email: (req as any).user?.email,
      },
    },
  });
});

export default router;