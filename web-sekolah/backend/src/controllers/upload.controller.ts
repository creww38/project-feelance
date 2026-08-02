import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHelper } from '../utils/responseHelper';
import { AppError } from '../utils/AppError';

const uploadService = new UploadService();

export class UploadController {
  uploadImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('File tidak ditemukan', 400);
    }
    
    const result = await uploadService.uploadImage(req.file);
    ResponseHelper.success(res, result, 'Gambar berhasil diupload');
  });

  uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('File tidak ditemukan', 400);
    }
    
    const result = await uploadService.uploadDocument(req.file);
    ResponseHelper.success(res, result, 'Dokumen berhasil diupload');
  });

  uploadMultiple = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError('File tidak ditemukan', 400);
    }
    
    const result = await uploadService.uploadMultiple(files);
    ResponseHelper.success(res, result, `${files.length} file berhasil diupload`);
  });

  uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('File tidak ditemukan', 400);
    }
    
    const result = await uploadService.uploadAvatar(req.file);
    ResponseHelper.success(res, result, 'Avatar berhasil diupload');
  });

  deleteFile = asyncHandler(async (req: Request, res: Response) => {
    await uploadService.deleteFile(req.params.publicId);
    ResponseHelper.success(res, null, 'File berhasil dihapus');
  });
}