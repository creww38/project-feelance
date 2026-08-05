import { Router } from 'express';
import { AbsensiController } from '../controllers/absensi.controller';
const router = Router();
const ctrl = new AbsensiController();
router.get('/siswa', ctrl.getBySiswa);
router.post('/', ctrl.record);
export default router;