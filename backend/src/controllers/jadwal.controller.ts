// src/controllers/jadwal.controller.ts
import { Request, Response } from 'express';
import { JadwalService } from '../services/jadwal.service';
import { asyncHandler } from '../utils/asyncHandler';

const jadwalService = new JadwalService();

export class JadwalController {
  getByKelas = asyncHandler(async (req: Request, res: Response) => {
    const { kelasId } = req.params;
    const jadwal = await jadwalService.getByKelas(kelasId);

    res.status(200).json({
      status: 'success',
      data: { jadwal },
    });
  });

  getByGuru = asyncHandler(async (req: Request, res: Response) => {
    const { guruId } = req.params;
    const jadwal = await jadwalService.getByGuru(guruId);

    res.status(200).json({
      status: 'success',
      data: { jadwal },
    });
  });

  getBySiswa = asyncHandler(async (req: Request, res: Response) => {
    const siswaId = req.user?.siswa?.id || req.params.siswaId;
    const jadwal = await jadwalService.getBySiswa(siswaId);

    res.status(200).json({
      status: 'success',
      data: { jadwal },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const jadwal = await jadwalService.create(data);

    res.status(201).json({
      status: 'success',
      data: { jadwal },
    });
  });

  createBulk = asyncHandler(async (req: Request, res: Response) => {
    const { jadwal: jadwalData } = req.body;
    const result = await jadwalService.createBulk(jadwalData);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const jadwal = await jadwalService.update(id, data);

    res.status(200).json({
      status: 'success',
      data: { jadwal },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await jadwalService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Jadwal berhasil dihapus',
    });
  });
}