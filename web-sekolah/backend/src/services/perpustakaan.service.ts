// src/services/perpustakaan.service.ts
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../utils/pagination';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';

export class PerpustakaanService {
  // BUKU
  async getBuku(options: PaginationOptions, filters: any) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { judul: { contains: filters.search, mode: 'insensitive' } },
        { pengarang: { contains: filters.search, mode: 'insensitive' } },
        { kode: { contains: filters.search, mode: 'insensitive' } },
        { isbn: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.kategori) {
      where.kategori = filters.kategori;
    }

    if (filters.tersedia === 'true') {
      where.tersedia = { gt: 0 };
    }

    const page = options.page || 1;
    const limit = options.limit || 10;

    const [items, total] = await Promise.all([
      prisma.buku.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: options.sortBy
          ? { [options.sortBy]: options.sortOrder || 'desc' }
          : { createdAt: 'desc' },
      }),
      prisma.buku.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBukuById(id: string) {
    const buku = await prisma.buku.findUnique({
      where: { id },
      include: {
        peminjaman: {
          where: { status: { in: ['DIPINJAM', 'TERLAMBAT'] } },
          include: {
            user: { select: { namaLengkap: true } },
          },
        },
      },
    });

    if (!buku) {
      throw new AppError('Buku tidak ditemukan', 404);
    }

    return buku;
  }

  async createBuku(data: any) {
    // Generate kode if not provided
    if (!data.kode) {
      data.kode = `BK${Date.now().toString().slice(-6)}`;
    }

    return prisma.buku.create({
      data: {
        ...data,
        tersedia: data.jumlah || 1,
      },
    });
  }

  async updateBuku(id: string, data: any) {
    const existing = await prisma.buku.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Buku tidak ditemukan', 404);
    }

    // If jumlah changes, adjust tersedia
    if (data.jumlah && data.jumlah !== existing.jumlah) {
      const selisih = data.jumlah - existing.jumlah;
      data.tersedia = existing.tersedia + selisih;
      if (data.tersedia < 0) data.tersedia = 0;
    }

    return prisma.buku.update({ where: { id }, data });
  }

  async deleteBuku(id: string) {
    const existing = await prisma.buku.findUnique({
      where: { id },
      include: {
        peminjaman: {
          where: { status: 'DIPINJAM' },
        },
      },
    });

    if (!existing) {
      throw new AppError('Buku tidak ditemukan', 404);
    }

    if (existing.peminjaman.length > 0) {
      throw new AppError('Buku sedang dipinjam, tidak dapat dihapus', 400);
    }

    return prisma.buku.delete({ where: { id } });
  }

  // PEMINJAMAN
  async pinjamBuku(data: { bukuId: string; userId: string }) {
    const buku = await prisma.buku.findUnique({ where: { id: data.bukuId } });

    if (!buku) {
      throw new AppError('Buku tidak ditemukan', 404);
    }

    if (buku.tersedia < 1) {
      throw new AppError('Buku tidak tersedia', 400);
    }

    // Check if user already borrowed this book
    const existingLoan = await prisma.peminjaman.findFirst({
      where: {
        bukuId: data.bukuId,
        userId: data.userId,
        status: { in: ['DIPINJAM', 'TERLAMBAT'] },
      },
    });

    if (existingLoan) {
      throw new AppError('Anda masih meminjam buku ini', 400);
    }

    // Check user's active loans count
    const activeLoans = await prisma.peminjaman.count({
      where: {
        userId: data.userId,
        status: { in: ['DIPINJAM', 'TERLAMBAT'] },
      },
    });

    if (activeLoans >= 3) {
      throw new AppError('Maksimal 3 buku dapat dipinjam', 400);
    }

    const kodePinjam = `PJM${Date.now().toString().slice(-8)}`;
    const batasKembali = addDays(new Date(), 7);

    const [peminjaman] = await prisma.$transaction([
      prisma.peminjaman.create({
        data: {
          bukuId: data.bukuId,
          userId: data.userId,
          kodePinjam,
          batasKembali,
          status: 'DIPINJAM',
        },
        include: {
          buku: { select: { judul: true, kode: true } },
          user: { select: { namaLengkap: true } },
        },
      }),
      prisma.buku.update({
        where: { id: data.bukuId },
        data: { tersedia: { decrement: 1 } },
      }),
    ]);

    return peminjaman;
  }

  async kembalikanBuku(peminjamanId: string) {
    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id: peminjamanId },
      include: { buku: true },
    });

    if (!peminjaman) {
      throw new AppError('Data peminjaman tidak ditemukan', 404);
    }

    if (peminjaman.status === 'DIKEMBALIKAN') {
      throw new AppError('Buku sudah dikembalikan', 400);
    }

    // Calculate fine if late
    let denda = 0;
    let status = 'DIKEMBALIKAN';

    if (new Date() > peminjaman.batasKembali) {
      const daysLate = Math.ceil(
        (new Date().getTime() - peminjaman.batasKembali.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      denda = daysLate * 1000; // Rp 1,000 per day
    }

    const [updated] = await prisma.$transaction([
      prisma.peminjaman.update({
        where: { id: peminjamanId },
        data: {
          tanggalKembali: new Date(),
          status,
          denda,
        },
      }),
      prisma.buku.update({
        where: { id: peminjaman.bukuId },
        data: { tersedia: { increment: 1 } },
      }),
    ]);

    return updated;
  }

  async getPeminjamanAktif(userId: string) {
    return prisma.peminjaman.findMany({
      where: {
        userId,
        status: { in: ['DIPINJAM', 'TERLAMBAT'] },
      },
      include: {
        buku: {
          select: { judul: true, kode: true, cover: true },
        },
      },
      orderBy: { batasKembali: 'asc' },
    });
  }

  async getRiwayatPeminjaman(options: PaginationOptions, filters: any) {
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const page = options.page || 1;
    const limit = options.limit || 10;

    const [items, total] = await Promise.all([
      prisma.peminjaman.findMany({
        where,
        include: {
          buku: { select: { judul: true, kode: true } },
          user: { select: { namaLengkap: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.peminjaman.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // Generate QR Code untuk buku
  async generateQRBuku(bukuId: string) {
    const buku = await prisma.buku.findUnique({ where: { id: bukuId } });
    if (!buku) {
      throw new AppError('Buku tidak ditemukan', 404);
    }

    const QRCode = require('qrcode');
    const qrCode = await QRCode.toDataURL(buku.kode, {
      width: 200,
      margin: 1,
    });

    return { kode: buku.kode, qrCode };
  }
}