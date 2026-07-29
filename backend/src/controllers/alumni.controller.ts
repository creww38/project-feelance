// src/controllers/alumni.controller.ts
import { Request, Response } from 'express';
import { AlumniService } from '../services/alumni.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationSchema } from '../validations/common.validation';

const alumniService = new AlumniService();

export class AlumniController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const filters = {
      search: req.query.search as string,
      tahunLulus: req.query.tahunLulus ? parseInt(req.query.tahunLulus as string) : undefined,
      jurusan: req.query.jurusan as string,
    };

    const result = await alumniService.getAll(query, filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const alumni = await alumniService.getById(id);

    res.status(200).json({
      status: 'success',
      data: { alumni },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const alumni = await alumniService.create(data);

    res.status(201).json({
      status: 'success',
      data: { alumni },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const alumni = await alumniService.update(id, data);

    res.status(200).json({
      status: 'success',
      data: { alumni },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await alumniService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Alumni berhasil dihapus',
    });
  });

  // Tracer Study
  getTracerStudy = asyncHandler(async (req: Request, res: Response) => {
    const { alumniId } = req.params;
    const tracer = await alumniService.getTracerStudy(alumniId);

    res.status(200).json({
      status: 'success',
      data: { items: tracer },
    });
  });

  addTracerStudy = asyncHandler(async (req: Request, res: Response) => {
    const { alumniId } = req.params;
    const data = req.body;
    const tracer = await alumniService.addTracerStudy(alumniId, data);

    res.status(201).json({
      status: 'success',
      data: { tracer },
    });
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await alumniService.getStats();

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  });
}