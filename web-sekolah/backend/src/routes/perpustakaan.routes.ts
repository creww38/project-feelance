// src/routes/perpustakaan.routes.ts
import { Router } from 'express';
import { PerpustakaanController } from '../controllers/perpustakaan.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();
const perpustakaanController = new PerpustakaanController();

// Buku routes
router.get('/buku', authenticate, perpustakaanController.getBuku);
router.get('/buku/:id', authenticate, perpustakaanController.getBukuById);
router.post('/buku', authenticate, authorize('ADMIN', 'STAFF_TU'), perpustakaanController.createBuku);
router.put('/buku/:id', authenticate, authorize('ADMIN', 'STAFF_TU'), perpustakaanController.updateBuku);
router.delete('/buku/:id', authenticate, authorize('ADMIN'), perpustakaanController.deleteBuku);
router.get('/buku/:id/qr', authenticate, perpustakaanController.generateQRBuku);

// Peminjaman routes
router.post('/pinjam', authenticate, perpustakaanController.pinjamBuku);
router.post('/kembalikan/:id', authenticate, perpustakaanController.kembalikanBuku);
router.get('/peminjaman/aktif', authenticate, perpustakaanController.getPeminjamanAktif);
router.get('/peminjaman/riwayat', authenticate, perpustakaanController.getRiwayatPeminjaman);

export default router;