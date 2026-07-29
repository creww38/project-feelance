// src/controllers/search.controller.ts
import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { asyncHandler } from '../utils/asyncHandler';

const searchService = new SearchService();

export class SearchController {
  global = asyncHandler(async (req: Request, res: Response) => {
    const { q, type, page, limit } = req.query;

    if (!q || (q as string).trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Query pencarian tidak boleh kosong',
      });
    }

    const results = await searchService.globalSearch(
      q as string,
      type as string,
      {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      }
    );

    res.status(200).json({
      status: 'success',
      data: results,
    });
  });

  autocomplete = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q || (q as string).trim().length < 2) {
      return res.status(200).json({
        status: 'success',
        data: { suggestions: [] },
      });
    }

    const suggestions = await searchService.autocomplete(q as string);

    res.status(200).json({
      status: 'success',
      data: { suggestions },
    });
  });

  searchBerita = asyncHandler(async (req: Request, res: Response) => {
    const { q, kategori, page, limit } = req.query;
    const results = await searchService.searchBerita(q as string, {
      kategori: kategori as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    });

    res.status(200).json({
      status: 'success',
      data: results,
    });
  });

  searchSiswa = asyncHandler(async (req: Request, res: Response) => {
    const { q, kelasId, page, limit } = req.query;
    const results = await searchService.searchSiswa(q as string, {
      kelasId: kelasId as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    });

    res.status(200).json({
      status: 'success',
      data: results,
    });
  });

  searchGuru = asyncHandler(async (req: Request, res: Response) => {
    const { q, page, limit } = req.query;
    const results = await searchService.searchGuru(q as string, {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    });

    res.status(200).json({
      status: 'success',
      data: results,
    });
  });
}