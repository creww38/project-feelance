// src/controllers/nilai.controller.ts
import { Request, Response } from 'express';
import { NilaiService } from '../services/nilai.service';
import { asyncHandler } from '../utils/asyncHandler';

const nilaiService = new NilaiService();

export class NilaiController {
  getBySiswa = asyncHandler(async (req: Request, res: Response) => {
    const { siswaId } = req.params;
    const { semester } = req.query;
    const nilai = await nilaiService.getBySiswa(
      siswaId,
      semester ? parseInt(semester as string) : undefined
    );

    res.status(200).json({
      status: 'success',
      data: { nilai },
    });
  });

  getByKelas = asyncHandler(async (req: Request, res: Response) => {
    const { kelasId, mataPelajaranId } = req.params;
    const { semester } = req.query;
    const nilai = await nilaiService.getByKelas(
      kelasId,
      mataPelajaranId,
      semester ? parseInt(semester as string) : undefined
    );

    res.status(200).json({
      status: 'success',
      data: { nilai },
    });
  });

  input = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const nilai = await nilaiService.input(data, req.user!.id);

    res.status(201).json({
      status: 'success',
      data: { nilai },
    });
  });

  inputBulk = asyncHandler(async (req: Request, res: Response) => {
    const { nilai: nilaiData } = req.body;
    const result = await nilaiService.inputBulk(nilaiData);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const nilai = await nilaiService.update(id, data);

    res.status(200).json({
      status: 'success',
      data: { nilai },
    });
  });

  getRapor = asyncHandler(async (req: Request, res: Response) => {
    const { siswaId } = req.params;
    const { semester } = req.query;
    const rapor = await nilaiService.getRapor(
      siswaId,
      semester ? parseInt(semester as string) : undefined
    );

    res.status(200).json({
      status: 'success',
      data: rapor,
    });
  });

  exportPDF = asyncHandler(async (req: Request, res: Response) => {
    const { siswaId } = req.params;
    const { semester } = req.query;
    const buffer = await nilaiService.exportRaporPDF(
      siswaId,
      semester ? parseInt(semester as string) : undefined
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapor-${siswaId}.pdf`);
    res.send(buffer);
  });
}