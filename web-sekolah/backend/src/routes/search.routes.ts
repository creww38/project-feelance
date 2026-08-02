// src/routes/search.routes.ts
import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { optionalAuth } from '../middlewares/auth.middleware';

const router = Router();
const searchController = new SearchController();

router.get('/', optionalAuth, searchController.globalSearch);
router.get('/berita', searchController.searchBerita);
router.get('/guru', searchController.searchGuru);
router.get('/siswa', searchController.searchSiswa);

export default router;