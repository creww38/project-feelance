// src/controllers/upload.controller.ts
import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service';
import { asyncHandler } from '../utils/asyncHandler';

const uploadService = new UploadService();

export class UploadController {
  single = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File tidak ditemukan',
      });
    }

    const result = await uploadService.uploadSingle(req.file);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  multiple = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'File tidak ditemukan',
      });
    }

    const result = await uploadService.uploadMultiple(files);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { publicId, url } = req.body;
    await uploadService.delete(publicId || url);

    res.status(200).json({
      status: 'success',
      message: 'File berhasil dihapus',
    });
  });

  // Upload specific types
  uploadImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File gambar tidak ditemukan',
      });
    }

    const result = await uploadService.uploadImage(req.file, {
      width: req.body.width ? parseInt(req.body.width) : undefined,
      height: req.body.height ? parseInt(req.body.height) : undefined,
      quality: req.body.quality ? parseInt(req.body.quality) : 80,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File dokumen tidak ditemukan',
      });
    }

    const result = await uploadService.uploadDocument(req.file);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  uploadVideo = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File video tidak ditemukan',
      });
    }

    const result = await uploadService.uploadVideo(req.file);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });
}