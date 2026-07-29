// src/controllers/pengumuman.controller.ts
import { Request, Response } from 'express';
import { PengumumanService } from '../services/pengumuman.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationSchema } from '../validations/common.validation';
import { AppError } from '../utils/AppError';

const pengumumanService = new PengumumanService();

export class PengumumanController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      isPinned: req.query.isPinned === 'true' ? true : req.query.isPinned === 'false' ? false : undefined,
    };

    const result = await pengumumanService.getAll(query, filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pengumuman = await pengumumanService.getById(id);

    res.status(200).json({
      status: 'success',
      data: { pengumuman },
    });
  });

  getPinned = asyncHandler(async (req: Request, res: Response) => {
    const pengumuman = await pengumumanService.getPinned();

    res.status(200).json({
      status: 'success',
      data: { items: pengumuman },
    });
  });

  getLatest = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const pengumuman = await pengumumanService.getLatest(limit);

    res.status(200).json({
      status: 'success',
      data: { items: pengumuman },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const { judul, konten, isPinned, priority, status, expiredAt } = req.body;

    if (!judul || !konten) {
      throw new AppError('Judul dan konten harus diisi', 400);
    }

    const pengumuman = await pengumumanService.create(
      {
        judul,
        konten,
        isPinned,
        priority,
        status,
        expiredAt: expiredAt ? new Date(expiredAt) : undefined,
      },
      req.user!.id,
      req.file
    );

    res.status(201).json({
      status: 'success',
      message: 'Pengumuman berhasil dibuat',
      data: { pengumuman },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    if (data.expiredAt) {
      data.expiredAt = new Date(data.expiredAt);
    }

    const pengumuman = await pengumumanService.update(id, data, req.file);

    res.status(200).json({
      status: 'success',
      message: 'Pengumuman berhasil diperbarui',
      data: { pengumuman },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await pengumumanService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Pengumuman berhasil dihapus',
    });
  });

  togglePin = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pengumuman = await pengumumanService.togglePin(id);

    res.status(200).json({
      status: 'success',
      message: `Pengumuman ${pengumuman.isPinned ? 'disematkan' : 'dilepas dari sematan'}`,
      data: { pengumuman },
    });
  });

  archive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pengumuman = await pengumumanService.archive(id);

    res.status(200).json({
      status: 'success',
      message: 'Pengumuman diarsipkan',
      data: { pengumuman },
    });
  });
}