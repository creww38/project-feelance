// src/controllers/ppdb.controller.ts
import { Request, Response } from 'express';
import { PPDBService } from '../services/ppdb.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationSchema } from '../validations/common.validation';
import { AppError } from '../utils/AppError';

const ppdbService = new PPDBService();

export class PPDBController {
  // ========== PUBLIC ==========

  getInfo = asyncHandler(async (req: Request, res: Response) => {
    const info = await ppdbService.getInfo();

    res.status(200).json({
      status: 'success',
      data: info,
    });
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const files = req.files as Express.Multer.File[];

    if (!data.namaLengkap || !data.jurusanId) {
      throw new AppError('Nama lengkap dan jurusan harus diisi', 400);
    }

    const pendaftaran = await ppdbService.register(data, files || []);

    res.status(201).json({
      status: 'success',
      message: 'Pendaftaran berhasil! Silakan catat nomor pendaftaran Anda.',
      data: {
        noPendaftaran: pendaftaran.noPendaftaran,
        nama: pendaftaran.namaLengkap,
      },
    });
  });

  checkStatus = asyncHandler(async (req: Request, res: Response) => {
    const { noPendaftaran } = req.params;
    const status = await ppdbService.checkStatus(noPendaftaran);

    res.status(200).json({
      status: 'success',
      data: status,
    });
  });

  // ========== ADMIN ==========

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      jurusanId: req.query.jurusanId as string,
      tahunAjaranId: req.query.tahunAjaranId as string,
    };

    const result = await ppdbService.getAll(query, filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pendaftaran = await ppdbService.getById(id);

    res.status(200).json({
      status: 'success',
      data: { pendaftaran },
    });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, catatan } = req.body;

    if (!status) {
      throw new AppError('Status harus diisi', 400);
    }

    const pendaftaran = await ppdbService.updateStatus(
      id,
      status,
      req.user!.id,
      catatan
    );

    res.status(200).json({
      status: 'success',
      message: 'Status pendaftaran berhasil diperbarui',
      data: { pendaftaran },
    });
  });

  updateBulkStatus = asyncHandler(async (req: Request, res: Response) => {
    const { ids, status, catatan } = req.body;
    const result = await ppdbService.updateBulkStatus(ids, status, req.user!.id, catatan);

    res.status(200).json({
      status: 'success',
      message: `${result.count} pendaftaran berhasil diperbarui`,
      data: result,
    });
  });

  verifyBerkas = asyncHandler(async (req: Request, res: Response) => {
    const { id, berkasId } = req.params;
    const { isVerified, catatan } = req.body;
    const berkas = await ppdbService.verifyBerkas(berkasId, isVerified, catatan);

    res.status(200).json({
      status: 'success',
      message: 'Berkas berhasil diverifikasi',
      data: { berkas },
    });
  });

  exportExcel = asyncHandler(async (req: Request, res: Response) => {
    const buffer = await ppdbService.exportExcel(req.query);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=data-ppdb.xlsx');
    res.send(buffer);
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await ppdbService.getStats();

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  });

  getCetakBukti = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const bukti = await ppdbService.getCetakBukti(id);

    res.status(200).json({
      status: 'success',
      data: bukti,
    });
  });
}
