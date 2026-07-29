// src/controllers/agenda.controller.ts
import { Request, Response } from 'express';
import { AgendaService } from '../services/agenda.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationSchema } from '../validations/common.validation';
import { AppError } from '../utils/AppError';

const agendaService = new AgendaService();

export class AgendaController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const filters = {
      search: req.query.search as string,
      bulan: req.query.bulan ? parseInt(req.query.bulan as string) : undefined,
      tahun: req.query.tahun ? parseInt(req.query.tahun as string) : undefined,
      isUpcoming: req.query.isUpcoming === 'true',
    };

    const result = await agendaService.getAll(query, filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const agenda = await agendaService.getById(id);

    res.status(200).json({
      status: 'success',
      data: { agenda },
    });
  });

  getUpcoming = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const agenda = await agendaService.getUpcoming(limit);

    res.status(200).json({
      status: 'success',
      data: { items: agenda },
    });
  });

  getByDateRange = asyncHandler(async (req: Request, res: Response) => {
    const { start, end } = req.query;

    if (!start || !end) {
      throw new AppError('Tanggal mulai dan selesai harus diisi', 400);
    }

    const agenda = await agendaService.getByDateRange(
      new Date(start as string),
      new Date(end as string)
    );

    res.status(200).json({
      status: 'success',
      data: { items: agenda },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;

    if (!data.judul || !data.tanggalMulai || !data.tanggalSelesai) {
      throw new AppError('Judul, tanggal mulai, dan tanggal selesai harus diisi', 400);
    }

    const agenda = await agendaService.create(data, req.user!.id);

    res.status(201).json({
      status: 'success',
      message: 'Agenda berhasil dibuat',
      data: { agenda },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const agenda = await agendaService.update(id, data);

    res.status(200).json({
      status: 'success',
      message: 'Agenda berhasil diperbarui',
      data: { agenda },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await agendaService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Agenda berhasil dihapus',
    });
  });

  toggleReminder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const agenda = await agendaService.toggleReminder(id);

    res.status(200).json({
      status: 'success',
      message: `Reminder ${agenda.reminder ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: { agenda },
    });
  });
}