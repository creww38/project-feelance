// src/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';

const dashboardService = new DashboardService();

export class DashboardController {
  admin = asyncHandler(async (req: Request, res: Response) => {
    const stats = await dashboardService.getAdminStats();

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  });

  kepsek = asyncHandler(async (req: Request, res: Response) => {
    const stats = await dashboardService.getKepsekStats();

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  });

  guru = asyncHandler(async (req: Request, res: Response) => {
    const guruId = req.user?.guru?.id;
    const stats = await dashboardService.getGuruStats(guruId!);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  });

  siswa = asyncHandler(async (req: Request, res: Response) => {
    const siswaId = req.user?.siswa?.id;
    const stats = await dashboardService.getSiswaStats(siswaId!);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  });

  orangTua = asyncHandler(async (req: Request, res: Response) => {
    const siswaId = req.user?.orangTua?.siswaId;
    const stats = await dashboardService.getOrangTuaStats(siswaId!);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  });
}