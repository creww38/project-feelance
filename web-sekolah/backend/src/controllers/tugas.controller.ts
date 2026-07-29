// src/controllers/tugas.controller.ts
import { Request, Response } from 'express';
import { ELearningService } from '../services/eLearning.service';
import { asyncHandler } from '../utils/asyncHandler';

const eLearningService = new ELearningService();

export class TugasController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      mataPelajaranId: req.query.mataPelajaranId as string,
      kelasId: req.query.kelasId as string,
      status: req.query.status as string,
    };
    const tugas = await eLearningService.getAllTugas(filters);

    res.status(200).json({
      status: 'success',
      data: { items: tugas },
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tugas = await eLearningService.getTugasById(id);

    res.status(200).json({
      status: 'success',
      data: { tugas },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const tugas = await eLearningService.createTugas(data, req.file, req.user!.id);

    res.status(201).json({
      status: 'success',
      data: { tugas },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const tugas = await eLearningService.updateTugas(id, data, req.file);

    res.status(200).json({
      status: 'success',
      data: { tugas },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await eLearningService.deleteTugas(id);

    res.status(200).json({
      status: 'success',
      message: 'Tugas berhasil dihapus',
    });
  });

  submitJawaban = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const jawaban = await eLearningService.submitJawaban(id, data, req.file, req.user!.id);

    res.status(201).json({
      status: 'success',
      data: { jawaban },
    });
  });

  gradeJawaban = asyncHandler(async (req: Request, res: Response) => {
    const { jawabanId } = req.params;
    const { nilai, komentar } = req.body;
    const jawaban = await eLearningService.gradeJawaban(jawabanId, nilai, komentar);

    res.status(200).json({
      status: 'success',
      data: { jawaban },
    });
  });
}