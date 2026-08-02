import { Request, Response } from 'express';
import { JadwalService } from '../services/jadwal.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHelper } from '../utils/responseHelper';
import { paginationSchema } from '../validations/common.validation';

const jadwalService = new JadwalService();

export class JadwalController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const result = await jadwalService.getAll(query, req.query);
    ResponseHelper.success(res, result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const jadwal = await jadwalService.getById(req.params.id);
    ResponseHelper.success(res, { jadwal });
  });

  getByKelas = asyncHandler(async (req: Request, res: Response) => {
    const result = await jadwalService.getByKelas(req.params.kelasId);
    ResponseHelper.success(res, { items: result });
  });

  getByGuru = asyncHandler(async (req: Request, res: Response) => {
    const hari = req.query.hari as string | undefined;
    const result = await jadwalService.getByGuru(req.params.guruId, hari);
    ResponseHelper.success(res, { items: result });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const jadwal = await jadwalService.create(req.body);
    ResponseHelper.created(res, { jadwal }, 'Jadwal berhasil ditambahkan');
  });

  createMany = asyncHandler(async (req: Request, res: Response) => {
    const result = await jadwalService.createMany(req.body.items);
    ResponseHelper.created(res, result, 'Jadwal berhasil ditambahkan');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const jadwal = await jadwalService.update(req.params.id, req.body);
    ResponseHelper.success(res, { jadwal }, 'Jadwal berhasil diupdate');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await jadwalService.delete(req.params.id);
    ResponseHelper.success(res, null, 'Jadwal berhasil dihapus');
  });
}