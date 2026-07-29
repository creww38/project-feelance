// src/controllers/pesan.controller.ts
import { Request, Response } from 'express';
import { PesanService } from '../services/pesan.service';
import { asyncHandler } from '../utils/asyncHandler';

const pesanService = new PesanService();

export class PesanController {
  getConversations = asyncHandler(async (req: Request, res: Response) => {
    const conversations = await pesanService.getConversations(req.user!.id);

    res.status(200).json({
      status: 'success',
      data: { items: conversations },
    });
  });

  getMessages = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const query = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };
    const messages = await pesanService.getMessages(req.user!.id, userId, query);

    res.status(200).json({
      status: 'success',
      data: messages,
    });
  });

  send = asyncHandler(async (req: Request, res: Response) => {
    const { penerimaId, konten } = req.body;
    const pesan = await pesanService.send(req.user!.id, penerimaId, konten, req.file);

    // Emit socket event
    const io = req.app.get('io');
    io.to(`user:${penerimaId}`).emit('message:receive', pesan);

    res.status(201).json({
      status: 'success',
      data: { pesan },
    });
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    await pesanService.markAsRead(req.user!.id, userId);

    res.status(200).json({
      status: 'success',
      message: 'Pesan ditandai sudah dibaca',
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await pesanService.delete(id, req.user!.id);

    res.status(200).json({
      status: 'success',
      message: 'Pesan berhasil dihapus',
    });
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await pesanService.getUnreadCount(req.user!.id);

    res.status(200).json({
      status: 'success',
      data: { count },
    });
  });
}