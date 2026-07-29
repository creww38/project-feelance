// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import beritaRoutes from './berita.routes';
import galeriRoutes from './galeri.routes';
import pengumumanRoutes from './pengumuman.routes';
import agendaRoutes from './agenda.routes';
import ppdbRoutes from './ppdb.routes';
import absensiRoutes from './absensi.routes';
import jadwalRoutes from './jadwal.routes';
import eLearningRoutes from './eLearning.routes';
import perpustakaanRoutes from './perpustakaan.routes';
import alumniRoutes from './alumni.routes';
import pesanRoutes from './pesan.routes';
import notifikasiRoutes from './notifikasi.routes';
import dashboardRoutes from './dashboard.routes';
import settingRoutes from './setting.routes';
import uploadRoutes from './upload.routes';
import searchRoutes from './search.routes';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/berita', beritaRoutes);
router.use('/galeri', galeriRoutes);
router.use('/pengumuman', pengumumanRoutes);
router.use('/agenda', agendaRoutes);
router.use('/ppdb', ppdbRoutes);
router.use('/search', searchRoutes);
router.use('/upload', uploadRoutes);

// Protected routes
router.use('/users', authenticate, userRoutes);
router.use('/absensi', authenticate, absensiRoutes);
router.use('/jadwal', authenticate, jadwalRoutes);
router.use('/e-learning', authenticate, eLearningRoutes);
router.use('/perpustakaan', authenticate, perpustakaanRoutes);
router.use('/alumni', authenticate, alumniRoutes);
router.use('/pesan', authenticate, pesanRoutes);
router.use('/notifikasi', authenticate, notifikasiRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);
router.use('/settings', authenticate, settingRoutes);

export default router;