import { Request, Response } from 'express';
import { NilaiService } from '../services/nilai.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHelper } from '../utils/responseHelper';
import { paginationSchema } from '../validations/common.validation';

const nilaiService = new NilaiService();

export class NilaiController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const result = await nilaiService.getAll(query, req.query);
    ResponseHelper.success(res, result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const nilai = await nilaiService.getById(req.params.id);
    ResponseHelper.success(res, { nilai });
  });

  getBySiswa = asyncHandler(async (req: Request, res: Response) => {
    const result = await nilaiService.getBySiswa(req.params.siswaId);
    ResponseHelper.success(res, { items: result });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const nilai = await nilaiService.create(req.body);
    ResponseHelper.created(res, { nilai }, 'Nilai berhasil ditambahkan');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const nilai = await nilaiService.update(req.params.id, req.body);
    ResponseHelper.success(res, { nilai }, 'Nilai berhasil diupdate');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await nilaiService.delete(req.params.id);
    ResponseHelper.success(res, null, 'Nilai berhasil dihapus');
  });

  getRekapKelas = asyncHandler(async (req: Request, res: Response) => {
    const semester = parseInt(req.query.semester as string) || 1;
    const result = await nilaiService.getRekapKelas(req.params.kelasId, semester);
    ResponseHelper.success(res, result);
  });

  importNilai = asyncHandler(async (req: Request, res: Response) => {
    const result = await nilaiService.importNilai(req.body.items);
    ResponseHelper.success(res, result, 'Import nilai selesai');
  });
}