import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHelper } from '../utils/responseHelper';
import { AppError } from '../utils/AppError';

export class KategoriController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const kategori = await prisma.kategori.findMany({
      include: {
        _count: { select: { berita: true } },
      },
      orderBy: { nama: 'asc' },
    });
    ResponseHelper.success(res, { kategori });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const kategori = await prisma.kategori.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { berita: true } },
      },
    });
    
    if (!kategori) {
      throw new AppError('Kategori tidak ditemukan', 404);
    }
    
    ResponseHelper.success(res, { kategori });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const { nama, deskripsi, warna, icon } = req.body;
    
    const slug = nama.toLowerCase().replace(/[\s]+/g, '-');
    
    const existing = await prisma.kategori.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Kategori dengan nama tersebut sudah ada', 400);
    }

    const kategori = await prisma.kategori.create({
      data: { nama, slug, deskripsi, warna, icon },
    });

    ResponseHelper.created(res, { kategori }, 'Kategori berhasil dibuat');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { nama, deskripsi, warna, icon } = req.body;
    const data: any = { deskripsi, warna, icon };
    
    if (nama) {
      data.nama = nama;
      data.slug = nama.toLowerCase().replace(/[\s]+/g, '-');
    }

    const kategori = await prisma.kategori.update({
      where: { id: req.params.id },
      data,
    });

    ResponseHelper.success(res, { kategori }, 'Kategori berhasil diupdate');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    // Check if category has news
    const beritaCount = await prisma.berita.count({
      where: { kategoriId: req.params.id },
    });

    if (beritaCount > 0) {
      throw new AppError('Kategori memiliki berita, tidak dapat dihapus', 400);
    }

    await prisma.kategori.delete({ where: { id: req.params.id } });
    ResponseHelper.success(res, null, 'Kategori berhasil dihapus');
  });
}