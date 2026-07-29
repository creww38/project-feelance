// src/controllers/notifikasi.controller.ts
import { Request, Response } from 'express';
import { NotifikasiService } from '../services/notifikasi.service';
import { asyncHandler } from '../utils/asyncHandler';

const notifikasiService = new NotifikasiService();

export class NotifikasiController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      status: req.query.status as string,
    };
    const notifikasi = await notifikasiService.getAll(req.user!.id, query);

    res.status(200).json({
      status: 'success',
      data: notifikasi,
    });
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await notifikasiService.getUnreadCount(req.user!.id);

    res.status(200).json({
      status: 'success',
      data: { count },
    });
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await notifikasiService.markAsRead(id, req.user!.id);

    res.status(200).json({
      status: 'success',
      message: 'Notifikasi ditandai sudah dibaca',
    });
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    await notifikasiService.markAllAsRead(req.user!.id);

    res.status(200).json({
      status: 'success',
      message: 'Semua notifikasi ditandai sudah dibaca',
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await notifikasiService.delete(id, req.user!.id);

    res.status(200).json({
      status: 'success',
      message: 'Notifikasi berhasil dihapus',
    });
  });
}