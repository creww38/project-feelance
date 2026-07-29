// src/controllers/berita.controller.ts
import { Request, Response } from 'express';
import { BeritaService } from '../services/berita.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationSchema } from '../validations/common.validation';
import { beritaSchema } from '../validations/berita.validation';

const beritaService = new BeritaService();

export class BeritaController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const result = await beritaService.getAll(query, req.query);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const berita = await beritaService.getBySlug(slug);

    res.status(200).json({
      status: 'success',
      data: { berita },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = beritaSchema.parse(req.body);
    const berita = await beritaService.create(data, req.user!.id);

    res.status(201).json({
      status: 'success',
      data: { berita },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = beritaSchema.partial().parse(req.body);
    const berita = await beritaService.update(id, data);

    res.status(200).json({
      status: 'success',
      data: { berita },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await beritaService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Berita berhasil dihapus',
    });
  });

  like = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await beritaService.toggleLike(id, req.user!.id);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getFeatured = asyncHandler(async (req: Request, res: Response) => {
    const result = await beritaService.getFeatured();

    res.status(200).json({
      status: 'success',
      data: { items: result },
    });
  });

  getTrending = asyncHandler(async (req: Request, res: Response) => {
    const result = await beritaService.getTrending();

    res.status(200).json({
      status: 'success',
      data: { items: result },
    });
  });
}