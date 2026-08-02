import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();
const dashboardController = new DashboardController();

router.get('/admin', authenticate, authorize('ADMIN'), dashboardController.admin);
router.get('/kepsek', authenticate, authorize('KEPALA_SEKOLAH'), dashboardController.kepsek);
router.get('/guru', authenticate, authorize('GURU'), dashboardController.guru);
router.get('/siswa', authenticate, authorize('SISWA'), dashboardController.siswa);
router.get('/orangtua', authenticate, authorize('ORANG_TUA'), dashboardController.orangTua);

export default router;