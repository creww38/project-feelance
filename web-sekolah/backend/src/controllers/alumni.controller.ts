import { Request, Response } from 'express';
import { AlumniService } from '../services/alumni.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHelper } from '../utils/responseHelper';
import { paginationSchema } from '../validations/common.validation';

const alumniService = new AlumniService();

export class AlumniController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const result = await alumniService.getAll(query, req.query);
    ResponseHelper.success(res, result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const alumni = await alumniService.getById(req.params.id);
    ResponseHelper.success(res, { alumni });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const alumni = await alumniService.create(req.body);
    ResponseHelper.created(res, { alumni }, 'Data alumni berhasil ditambahkan');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const alumni = await alumniService.update(req.params.id, req.body);
    ResponseHelper.success(res, { alumni }, 'Data alumni berhasil diupdate');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await alumniService.delete(req.params.id);
    ResponseHelper.success(res, null, 'Data alumni berhasil dihapus');
  });

  addTracerStudy = asyncHandler(async (req: Request, res: Response) => {
    const tracer = await alumniService.addTracerStudy(req.params.id, req.body);
    ResponseHelper.created(res, { tracer }, 'Tracer study berhasil ditambahkan');
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await alumniService.getStats();
    ResponseHelper.success(res, stats);
  });
}