// src/routes/absensi.routes.ts
import { Router } from 'express';
import { AbsensiController } from '../controllers/absensi.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();
const absensiController = new AbsensiController();

// Siswa routes
router.get('/siswa', authenticate, authorize('SISWA'), absensiController.getBySiswa);
router.get('/siswa/statistik', authenticate, authorize('SISWA'), absensiController.getStatistikSiswa);

// QR Code based attendance
router.post('/qr/record', authenticate, absensiController.recordByQR);
router.get('/qr/generate', authenticate, absensiController.generateQR);

// Guru/Admin routes
router.get('/kelas/:kelasId', authenticate, authorize('GURU', 'ADMIN'), absensiController.getByKelas);
router.post('/', authenticate, authorize('GURU', 'ADMIN', 'STAFF_TU'), absensiController.record);
router.get('/rekap/:kelasId', authenticate, authorize('GURU', 'ADMIN', 'KEPALA_SEKOLAH'), absensiController.getRekap);

export default router;