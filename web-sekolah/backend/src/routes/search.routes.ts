import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
const router = Router();
const ctrl = new SearchController();
router.get('/', ctrl.globalSearch);
export default router;