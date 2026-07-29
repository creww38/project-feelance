// src/services/perpustakaan.service.ts
import { PerpustakaanRepository } from '../repositories/perpustakaan.repository';
import { AppError } from '../utils/AppError';
import { uploadToCloudinary } from '../config/cloudinary';
import prisma from '../config/database';
import fs from 'fs/promises';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const perpustakaanRepository = new PerpustakaanRepository();

export class PerpustakaanService {
  async getAllBuku(options: any, filters: any) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { judul: { contains: filters.search, mode: 'insensitive' } },
        { pengarang: { contains: filters.search, mode: 'insensitive' } },
        { kode: { contains: filters.search } },
      ];
    }

    if (filters.kategori) where.kategori = filters.kategori;
    if (filters.tersedia) where.tersedia = { gt: 0 };

    return perpustakaanRepository.findAll(options, where);
  }

  async getBukuById(id: string) {
    const buku = await perpustakaanRepository.findById(id);
    if (!buku) throw new AppError('Buku tidak ditemukan', 404);
    return buku;
  }

  async createBuku(data: any, file?: Express.Multer.File) {
    const kode = data.kode || `BK${uuidv4().substring(0, 8).toUpperCase()}`;
    let cover = null;

    if (file) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(file.path, 'buku');
        cover = result.secure_url;
        await fs.unlink(file.path);
      } else {
        cover = `/uploads/images/${file.filename}`;
      }
    }

    return perpustakaanRepository.create({
      ...data,
      kode,
      cover,
      tersedia: data.jumlah || 1,
    });
  }

  async updateBuku(id: string, data: any, file?: Express.Multer.File) {
    const updateData: any = { ...data };
    if (file) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(file.path, 'buku');
        updateData.cover = result.secure_url;
        await fs.unlink(file.path);
      } else {
        updateData.cover = `/uploads/images/${file.filename}`;
      }
    }
    return perpustakaanRepository.update(id, updateData);
  }

  async deleteBuku(id: string) {
    await perpustakaanRepository.delete(id);
  }

  async pinjamBuku(bukuId: string, userId: string) {
    const buku = await perpustakaanRepository.findById(bukuId);
    if (!buku) throw new AppError('Buku tidak ditemukan', 404);
    if (buku.tersedia < 1) throw new AppError('Buku tidak tersedia', 400);

    const kodePinjam = `PJM${Date.now().toString(36).toUpperCase()}`;
    const batasKembali = new Date();
    batasKembali.setDate(batasKembali.getDate() + 7);

    const peminjaman = await prisma.peminjaman.create({
      data: {
        bukuId,
        userId,
        kodePinjam,
        batasKembali,
      },
    });

    // Update jumlah tersedia
    await perpustakaanRepository.update(bukuId, {
      tersedia: buku.tersedia - 1,
    });

    return peminjaman;
  }

  async kembalikanBuku(peminjamanId: string) {
    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id: peminjamanId },
      include: { buku: true },
    });

    if (!peminjaman) throw new AppError('Peminjaman tidak ditemukan', 404);
    if (peminjaman.status === 'DIKEMBALIKAN') throw new AppError('Buku sudah dikembalikan', 400);

    const sekarang = new Date();
    let denda = 0;
    let status = 'DIKEMBALIKAN';

    if (sekarang > peminjaman.batasKembali) {
      const terlambat = Math.ceil(
        (sekarang.getTime() - peminjaman.batasKembali.getTime()) / (1000 * 60 * 60 * 24)
      );
      denda = terlambat * 1000; // Rp 1.000 per hari
      status = 'TERLAMBAT';
    }

    const result = await prisma.peminjaman.update({
      where: { id: peminjamanId },
      data: {
        tanggalKembali: sekarang,
        status,
        denda,
      },
    });

    // Update jumlah tersedia
    await perpustakaanRepository.update(peminjaman.bukuId, {
      tersedia: peminjaman.buku.tersedia + 1,
    });

    return result;
  }

  async getPeminjamanAktif(userId: string) {
    return prisma.peminjaman.findMany({
      where: {
        userId,
        status: { in: ['DIPINJAM', 'TERLAMBAT'] },
      },
      include: { buku: true },
    });
  }

  async getRiwayatPeminjaman(options: any) {
    const page = options.page || 1;
    const limit = options.limit || 10;

    const [items, total] = await Promise.all([
      prisma.peminjaman.findMany({
        include: {
          buku: { select: { id: true, judul: true, kode: true } },
          user: { select: { id: true, namaLengkap: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.peminjaman.count(),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async generateQR(bukuId: string) {
    const buku = await perpustakaanRepository.findById(bukuId);
    if (!buku) throw new AppError('Buku tidak ditemukan', 404);

    const qrData = JSON.stringify({ bukuId, kode: buku.kode });
    const qrCode = await QRCode.toDataURL(qrData);
    return qrCode;
  }

  async scanQR(qrData: string, userId: string) {
    const data = JSON.parse(qrData);
    return this.pinjamBuku(data.bukuId, userId);
  }
}