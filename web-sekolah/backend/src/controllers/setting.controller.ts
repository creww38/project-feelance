// src/controllers/setting.controller.ts
import { Request, Response } from 'express';
import { SettingService } from '../services/setting.service';
import { asyncHandler } from '../utils/asyncHandler';

const settingService = new SettingService();

export class SettingController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingService.getAll();

    res.status(200).json({
      status: 'success',
      data: { settings },
    });
  });

  getPublic = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingService.getPublic();

    res.status(200).json({
      status: 'success',
      data: { settings },
    });
  });

  getByKey = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const setting = await settingService.getByKey(key);

    res.status(200).json({
      status: 'success',
      data: { setting },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const { value, deskripsi } = req.body;
    const setting = await settingService.update(key, value, deskripsi);

    res.status(200).json({
      status: 'success',
      data: { setting },
    });
  });

  updateBulk = asyncHandler(async (req: Request, res: Response) => {
    const { settings } = req.body;
    const result = await settingService.updateBulk(settings);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  backup = asyncHandler(async (req: Request, res: Response) => {
    const backup = await settingService.backup();

    res.status(200).json({
      status: 'success',
      data: backup,
    });
  });

  restore = asyncHandler(async (req: Request, res: Response) => {
    const { data } = req.body;
    await settingService.restore(data);

    res.status(200).json({
      status: 'success',
      message: 'Data berhasil direstore',
    });
  });
}