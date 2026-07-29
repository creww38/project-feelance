// src/controllers/siswa.controller.ts
import { Request, Response } from 'express';
import { SiswaService } from '../services/siswa.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationSchema } from '../validations/common.validation';

const siswaService = new SiswaService();

export class SiswaController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const filters = {
      search: req.query.search as string,
      kelasId: req.query.kelasId as string,
      jurusanId: req.query.jurusanId as string,
      status: req.query.status as string,
      tahunMasuk: req.query.tahunMasuk ? parseInt(req.query.tahunMasuk as string) : undefined,
    };

    const result = await siswaService.getAll(query, filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const siswa = await siswaService.getById(id);

    res.status(200).json({
      status: 'success',
      data: { siswa },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const siswa = await siswaService.create(data);

    res.status(201).json({
      status: 'success',
      message: 'Siswa berhasil ditambahkan',
      data: { siswa },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const siswa = await siswaService.update(id, data);

    res.status(200).json({
      status: 'success',
      message: 'Data siswa berhasil diperbarui',
      data: { siswa },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await siswaService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Siswa berhasil dihapus',
    });
  });

  getByKelas = asyncHandler(async (req: Request, res: Response) => {
    const { kelasId } = req.params;
    const siswa = await siswaService.getByKelas(kelasId);

    res.status(200).json({
      status: 'success',
      data: { items: siswa },
    });
  });

  importExcel = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File Excel tidak ditemukan',
      });
    }

    const result = await siswaService.importExcel(req.file);

    res.status(200).json({
      status: 'success',
      message: `Berhasil import ${result.success} siswa, ${result.failed} gagal`,
      data: result,
    });
  });

  exportExcel = asyncHandler(async (req: Request, res: Response) => {
    const buffer = await siswaService.exportExcel(req.query);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=data-siswa.xlsx');
    res.send(buffer);
  });

  getStatistik = asyncHandler(async (req: Request, res: Response) => {
    const statistik = await siswaService.getStatistik();

    res.status(200).json({
      status: 'success',
      data: statistik,
    });
  });

  pindahKelas = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { kelasId } = req.body;
    const siswa = await siswaService.pindahKelas(id, kelasId);

    res.status(200).json({
      status: 'success',
      message: 'Siswa berhasil dipindahkan ke kelas baru',
      data: { siswa },
    });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const siswa = await siswaService.updateStatus(id, status);

    res.status(200).json({
      status: 'success',
      message: 'Status siswa berhasil diperbarui',
      data: { siswa },
    });
  });
}