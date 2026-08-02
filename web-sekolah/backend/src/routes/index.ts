import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';

// Import all route files
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import beritaRoutes from './berita.routes';
import pengumumanRoutes from './pengumuman.routes';
import agendaRoutes from './agenda.routes';
import galeriRoutes from './galeri.routes';
import ppdbRoutes from './ppdb.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// ============================================
// PUBLIC ROUTES (No Auth Required)
// ============================================
router.use('/auth', authRoutes);
router.use('/berita', beritaRoutes);
router.use('/pengumuman', pengumumanRoutes);
router.use('/agenda', agendaRoutes);
router.use('/galeri', galeriRoutes);
router.use('/ppdb', ppdbRoutes);

// ============================================
// PROTECTED ROUTES (Auth Required)
// ============================================
router.use('/users', authenticate, userRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);

// ============================================
// ROOT API CHECK
// ============================================
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SISTech API is running',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

export default router;