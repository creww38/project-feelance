// src/controllers/absensi.controller.ts
import { Request, Response } from 'express';
import { AbsensiService } from '../services/absensi.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

const absensiService = new AbsensiService();

export class AbsensiController {
  getByDate = asyncHandler(async (req: Request, res: Response) => {
    const { kelasId } = req.params;
    const { tanggal } = req.query;
    const absensi = await absensiService.getByDate(
      kelasId,
      tanggal ? new Date(tanggal as string) : new Date()
    );

    res.status(200).json({
      status: 'success',
      data: { items: absensi },
    });
  });

  record = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;

    if (!data.siswaId || !data.status) {
      throw new AppError('Siswa dan status harus diisi', 400);
    }

    const absensi = await absensiService.record(data, req.user!.id);

    res.status(201).json({
      status: 'success',
      message: 'Absensi berhasil dicatat',
      data: { absensi },
    });
  });

  recordBulk = asyncHandler(async (req: Request, res: Response) => {
    const { absensi: absensiData } = req.body;

    if (!absensiData || !Array.isArray(absensiData)) {
      throw new AppError('Data absensi tidak valid', 400);
    }

    const result = await absensiService.recordBulk(absensiData);

    res.status(201).json({
      status: 'success',
      message: `${result.length} absensi berhasil dicatat`,
      data: { items: result },
    });
  });

  getBySiswa = asyncHandler(async (req: Request, res: Response) => {
    const { siswaId } = req.params;
    const { bulan, tahun } = req.query;
    const absensi = await absensiService.getBySiswa(
      siswaId,
      bulan ? parseInt(bulan as string) : undefined,
      tahun ? parseInt(tahun as string) : undefined
    );

    res.status(200).json({
      status: 'success',
      data: { items: absensi },
    });
  });

  getMyAbsensi = asyncHandler(async (req: Request, res: Response) => {
    const siswaId = req.user?.siswa?.id;
    if (!siswaId) throw new AppError('Anda bukan siswa', 403);

    const { bulan, tahun } = req.query;
    const absensi = await absensiService.getBySiswa(
      siswaId,
      bulan ? parseInt(bulan as string) : undefined,
      tahun ? parseInt(tahun as string) : undefined
    );

    res.status(200).json({
      status: 'success',
      data: { items: absensi },
    });
  });

  getRekap = asyncHandler(async (req: Request, res: Response) => {
    const { kelasId } = req.params;
    const { bulan, tahun } = req.query;
    const rekap = await absensiService.getRekap(
      kelasId,
      bulan ? parseInt(bulan as string) : undefined,
      tahun ? parseInt(tahun as string) : undefined
    );

    res.status(200).json({
      status: 'success',
      data: rekap,
    });
  });

  generateQR = asyncHandler(async (req: Request, res: Response) => {
    const { kelasId } = req.params;
    const qrCode = await absensiService.generateQR(kelasId, new Date());

    res.status(200).json({
      status: 'success',
      data: { qrCode },
    });
  });

  scanQR = asyncHandler(async (req: Request, res: Response) => {
    const { qrData } = req.body;

    if (!qrData) {
      throw new AppError('QR data tidak valid', 400);
    }

    const absensi = await absensiService.scanQR(qrData, req.user!.id);

    res.status(200).json({
      status: 'success',
      message: 'Absensi berhasil',
      data: { absensi },
    });
  });

  exportPDF = asyncHandler(async (req: Request, res: Response) => {
    const { kelasId } = req.params;
    const { bulan, tahun } = req.query;
    const buffer = await absensiService.exportPDF(
      kelasId,
      bulan ? parseInt(bulan as string) : undefined,
      tahun ? parseInt(tahun as string) : undefined
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rekap-absensi-${kelasId}.pdf`);
    res.send(buffer);
  });
}