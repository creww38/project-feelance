// src/controllers/materi.controller.ts
import { Request, Response } from 'express';
import { ELearningService } from '../services/eLearning.service';
import { asyncHandler } from '../utils/asyncHandler';

const eLearningService = new ELearningService();

export class MateriController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      mataPelajaranId: req.query.mataPelajaranId as string,
      kelasId: req.query.kelasId as string,
      search: req.query.search as string,
    };
    const materi = await eLearningService.getAllMateri(filters);

    res.status(200).json({
      status: 'success',
      data: { items: materi },
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const materi = await eLearningService.getMateriById(id);

    res.status(200).json({
      status: 'success',
      data: { materi },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const materi = await eLearningService.createMateri(data, req.file, req.user!.id);

    res.status(201).json({
      status: 'success',
      data: { materi },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const materi = await eLearningService.updateMateri(id, data, req.file);

    res.status(200).json({
      status: 'success',
      data: { materi },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await eLearningService.deleteMateri(id);

    res.status(200).json({
      status: 'success',
      message: 'Materi berhasil dihapus',
    });
  });
}