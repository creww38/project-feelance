// src/controllers/kategori.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { generateSlug } from '../utils/slug';

export class KategoriController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const kategori = await prisma.kategori.findMany({
      include: {
        _count: { select: { berita: true } },
      },
      orderBy: { nama: 'asc' },
    });

    res.status(200).json({
      status: 'success',
      data: { items: kategori },
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const kategori = await prisma.kategori.findUnique({
      where: { id },
      include: {
        berita: {
          where: { status: 'PUBLISHED' },
          take: 10,
          orderBy: { publishedAt: 'desc' },
          include: {
            author: { select: { id: true, namaLengkap: true } },
          },
        },
        _count: { select: { berita: true } },
      },
    });

    if (!kategori) {
      throw new AppError('Kategori tidak ditemukan', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { kategori },
    });
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const kategori = await prisma.kategori.findUnique({
      where: { slug },
      include: {
        berita: {
          where: { status: 'PUBLISHED' },
          orderBy: { publishedAt: 'desc' },
          include: {
            author: { select: { id: true, namaLengkap: true } },
          },
        },
      },
    });

    if (!kategori) {
      throw new AppError('Kategori tidak ditemukan', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { kategori },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const { nama, deskripsi, warna, icon } = req.body;
    
    if (!nama) {
      throw new AppError('Nama kategori harus diisi', 400);
    }

    const slug = generateSlug(nama);

    // Check if slug exists
    const existing = await prisma.kategori.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Kategori dengan nama tersebut sudah ada', 400);
    }

    const kategori = await prisma.kategori.create({
      data: { nama, slug, deskripsi, warna, icon },
    });

    res.status(201).json({
      status: 'success',
      message: 'Kategori berhasil dibuat',
      data: { kategori },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nama, deskripsi, warna, icon } = req.body;

    const existing = await prisma.kategori.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Kategori tidak ditemukan', 404);
    }

    const updateData: any = {};
    if (nama) {
      updateData.nama = nama;
      updateData.slug = generateSlug(nama);
    }
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (warna !== undefined) updateData.warna = warna;
    if (icon !== undefined) updateData.icon = icon;

    const kategori = await prisma.kategori.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      status: 'success',
      message: 'Kategori berhasil diperbarui',
      data: { kategori },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const kategori = await prisma.kategori.findUnique({
      where: { id },
      include: { _count: { select: { berita: true } } },
    });

    if (!kategori) {
      throw new AppError('Kategori tidak ditemukan', 404);
    }

    if (kategori._count.berita > 0) {
      throw new AppError('Kategori masih memiliki berita, tidak dapat dihapus', 400);
    }

    await prisma.kategori.delete({ where: { id } });

    res.status(200).json({
      status: 'success',
      message: 'Kategori berhasil dihapus',
    });
  });
}