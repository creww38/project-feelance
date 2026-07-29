// src/controllers/galeri.controller.ts
import { Request, Response } from 'express';
import { GaleriService } from '../services/galeri.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationSchema } from '../validations/common.validation';
import { AppError } from '../utils/AppError';

const galeriService = new GaleriService();

export class GaleriController {
  // ========== ALBUM ==========
  
  getAllAlbums = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const result = await galeriService.getAllAlbums(query);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getAlbumById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const album = await galeriService.getAlbumById(id);

    res.status(200).json({
      status: 'success',
      data: { album },
    });
  });

  createAlbum = asyncHandler(async (req: Request, res: Response) => {
    const { nama, deskripsi, isPublished } = req.body;
    
    if (!nama) {
      throw new AppError('Nama album harus diisi', 400);
    }

    const album = await galeriService.createAlbum(
      { nama, deskripsi, isPublished },
      req.file
    );

    res.status(201).json({
      status: 'success',
      message: 'Album berhasil dibuat',
      data: { album },
    });
  });

  updateAlbum = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nama, deskripsi, isPublished } = req.body;
    const album = await galeriService.updateAlbum(
      id,
      { nama, deskripsi, isPublished },
      req.file
    );

    res.status(200).json({
      status: 'success',
      message: 'Album berhasil diperbarui',
      data: { album },
    });
  });

  deleteAlbum = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await galeriService.deleteAlbum(id);

    res.status(200).json({
      status: 'success',
      message: 'Album berhasil dihapus',
    });
  });

  // ========== GALERI ITEMS ==========

  getItems = asyncHandler(async (req: Request, res: Response) => {
    const { albumId } = req.params;
    const query = paginationSchema.parse(req.query);
    const result = await galeriService.getItems(albumId, query);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getItemById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await galeriService.getItemById(id);

    res.status(200).json({
      status: 'success',
      data: { item },
    });
  });

  uploadItems = asyncHandler(async (req: Request, res: Response) => {
    const { albumId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('File tidak ditemukan', 400);
    }

    const items = await galeriService.uploadItems(albumId, files, req.user!.id);

    res.status(201).json({
      status: 'success',
      message: `${items.length} file berhasil diupload`,
      data: { items },
    });
  });

  updateItem = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { judul, deskripsi } = req.body;
    const item = await galeriService.updateItem(id, { judul, deskripsi });

    res.status(200).json({
      status: 'success',
      message: 'Item berhasil diperbarui',
      data: { item },
    });
  });

  deleteItem = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await galeriService.deleteItem(id);

    res.status(200).json({
      status: 'success',
      message: 'Item berhasil dihapus',
    });
  });

  // ========== PUBLIC ==========

  getPublicAlbums = asyncHandler(async (req: Request, res: Response) => {
    const albums = await galeriService.getPublicAlbums();

    res.status(200).json({
      status: 'success',
      data: { items: albums },
    });
  });

  getPublicItems = asyncHandler(async (req: Request, res: Response) => {
    const { albumId } = req.params;
    const query = paginationSchema.parse(req.query);
    const result = await galeriService.getPublicItems(albumId, query);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });
}