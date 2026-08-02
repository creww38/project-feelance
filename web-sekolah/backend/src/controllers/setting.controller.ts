import { Request, Response } from 'express';
import { SettingService } from '../services/setting.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHelper } from '../utils/responseHelper';

const settingService = new SettingService();

export class SettingController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingService.getAll();
    ResponseHelper.success(res, { settings });
  });

  getPublic = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingService.getPublicSettings();
    ResponseHelper.success(res, settings);
  });

  getByKey = asyncHandler(async (req: Request, res: Response) => {
    const setting = await settingService.getByKey(req.params.key);
    ResponseHelper.success(res, { setting });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const setting = await settingService.update(req.params.id, req.body);
    ResponseHelper.success(res, { setting }, 'Setting berhasil diupdate');
  });

  set = asyncHandler(async (req: Request, res: Response) => {
    const { key, value, deskripsi } = req.body;
    await settingService.set(key, value, deskripsi);
    ResponseHelper.success(res, null, 'Setting berhasil disimpan');
  });
}