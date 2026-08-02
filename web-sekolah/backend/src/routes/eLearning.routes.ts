// src/routes/eLearning.routes.ts
import { Router } from 'express';
import { ELearningController } from '../controllers/eLearning.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();
const eLearningController = new ELearningController();

// Materi routes
router.get('/materi', authenticate, eLearningController.getMateri);
router.get('/materi/:id', authenticate, eLearningController.getMateriById);
router.post('/materi', authenticate, authorize('GURU', 'ADMIN'), eLearningController.createMateri);
router.put('/materi/:id', authenticate, authorize('GURU', 'ADMIN'), eLearningController.updateMateri);
router.delete('/materi/:id', authenticate, authorize('GURU', 'ADMIN'), eLearningController.deleteMateri);

// Tugas routes
router.get('/tugas', authenticate, eLearningController.getTugas);
router.get('/tugas/:id', authenticate, eLearningController.getTugasById);
router.post('/tugas', authenticate, authorize('GURU', 'ADMIN'), eLearningController.createTugas);
router.put('/tugas/:id', authenticate, authorize('GURU', 'ADMIN'), eLearningController.updateTugas);
router.delete('/tugas/:id', authenticate, authorize('GURU', 'ADMIN'), eLearningController.deleteTugas);

// Jawaban routes
router.post('/tugas/:tugasId/jawaban', authenticate, authorize('SISWA'), eLearningController.submitJawaban);
router.put('/jawaban/:jawabanId/nilai', authenticate, authorize('GURU'), eLearningController.nilaiJawaban);
router.get('/tugas/:tugasId/jawaban', authenticate, authorize('GURU'), eLearningController.getJawabanByTugas);

export default router;