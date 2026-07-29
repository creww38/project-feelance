// src/controllers/perpustakaan.controller.ts
import { Request, Response } from 'express';
import { PerpustakaanService } from '../services/perpustakaan.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationSchema } from '../validations/common.validation';

const perpustakaanService = new PerpustakaanService();

export class PerpustakaanController {
  // Buku
  getAllBuku = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const filters = {
      search: req.query.search as string,
      kategori: req.query.kategori as string,
      tersedia: req.query.tersedia === 'true',
    };

    const result = await perpustakaanService.getAllBuku(query, filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getBukuById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const buku = await perpustakaanService.getBukuById(id);

    res.status(200).json({
      status: 'success',
      data: { buku },
    });
  });

  createBuku = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const buku = await perpustakaanService.createBuku(data, req.file);

    res.status(201).json({
      status: 'success',
      data: { buku },
    });
  });

  updateBuku = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const buku = await perpustakaanService.updateBuku(id, data, req.file);

    res.status(200).json({
      status: 'success',
      data: { buku },
    });
  });

  deleteBuku = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await perpustakaanService.deleteBuku(id);

    res.status(200).json({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
  });

  // Peminjaman
  pinjamBuku = asyncHandler(async (req: Request, res: Response) => {
    const { bukuId } = req.body;
    const peminjaman = await perpustakaanService.pinjamBuku(bukuId, req.user!.id);

    res.status(201).json({
      status: 'success',
      data: { peminjaman },
    });
  });

  kembalikanBuku = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const peminjaman = await perpustakaanService.kembalikanBuku(id);

    res.status(200).json({
      status: 'success',
      data: { peminjaman },
    });
  });

  getPeminjamanAktif = asyncHandler(async (req: Request, res: Response) => {
    const result = await perpustakaanService.getPeminjamanAktif(req.user!.id);

    res.status(200).json({
      status: 'success',
      data: { items: result },
    });
  });

  getRiwayatPeminjaman = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const result = await perpustakaanService.getRiwayatPeminjaman(query);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  generateQR = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const qrCode = await perpustakaanService.generateQR(id);

    res.status(200).json({
      status: 'success',
      data: { qrCode },
    });
  });

  scanQR = asyncHandler(async (req: Request, res: Response) => {
    const { qrData } = req.body;
    const result = await perpustakaanService.scanQR(qrData, req.user!.id);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });
}