// src/services/ppdb.service.ts
import { PPDBRepository } from '../repositories/ppdb.repository';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../utils/pagination';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';

export class PPDBService {
  private ppdbRepository: PPDBRepository;

  constructor() {
    this.ppdbRepository = new PPDBRepository();
  }

  async getAll(options: PaginationOptions, filters: any) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.jurusanId) {
      where.jurusanId = filters.jurusanId;
    }

    if (filters.tahunAjaranId) {
      where.tahunAjaranId = filters.tahunAjaranId;
    }

    if (filters.search) {
      where.OR = [
        { namaLengkap: { contains: filters.search, mode: 'insensitive' } },
        { noPendaftaran: { contains: filters.search, mode: 'insensitive' } },
        { nisn: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.ppdbRepository.findAll(options, where);
  }

  async getById(id: string) {
    const ppdb = await this.ppdbRepository.findById(id);
    if (!ppdb) {
      throw new AppError('Data PPDB tidak ditemukan', 404);
    }
    return ppdb;
  }

  async getByNoPendaftaran(noPendaftaran: string) {
    const ppdb = await this.ppdbRepository.findByNoPendaftaran(noPendaftaran);
    if (!ppdb) {
      throw new AppError('Data PPDB tidak ditemukan', 404);
    }
    return ppdb;
  }

  async create(data: any) {
    // Generate registration number
    const noPendaftaran = await this.generateNoPendaftaran();

    const ppdb = await this.ppdbRepository.create({
      ...data,
      noPendaftaran,
      status: 'DRAFT',
      tanggalLahir: new Date(data.tanggalLahir),
    });

    return ppdb;
  }

  async update(id: string, data: any) {
    const existing = await this.ppdbRepository.findById(id);
    if (!existing) {
      throw new AppError('Data PPDB tidak ditemukan', 404);
    }

    if (existing.status !== 'DRAFT') {
      throw new AppError('Data yang sudah disubmit tidak dapat diubah', 400);
    }

    return this.ppdbRepository.update(id, data);
  }

  async submit(id: string) {
    const existing = await this.ppdbRepository.findById(id);
    if (!existing) {
      throw new AppError('Data PPDB tidak ditemukan', 404);
    }

    if (existing.status !== 'DRAFT') {
      throw new AppError('Data sudah disubmit', 400);
    }

    // Check required documents
    const requiredDocs = ['IJAZAH', 'SKHUN', 'KK', 'AKTE', 'FOTO'];
    const uploadedDocs = existing.berkas.map((b: any) => b.jenis);

    for (const doc of requiredDocs) {
      if (!uploadedDocs.includes(doc)) {
        throw new AppError(`Berkas ${doc} belum diupload`, 400);
      }
    }

    return this.ppdbRepository.update(id, { status: 'SUBMITTED' });
  }

  async verify(id: string, data: { status: string; catatan?: string }, verifierId: string) {
    const existing = await this.ppdbRepository.findById(id);
    if (!existing) {
      throw new AppError('Data PPDB tidak ditemukan', 404);
    }

    return this.ppdbRepository.update(id, {
      status: data.status,
      catatan: data.catatan,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
    });
  }

  async uploadBerkas(id: string, fileData: { nama: string; jenis: string; url: string }) {
    const existing = await this.ppdbRepository.findById(id);
    if (!existing) {
      throw new AppError('Data PPDB tidak ditemukan', 404);
    }

    return prisma.pPDBBerkas.create({
      data: {
        ppdbId: id,
        nama: fileData.nama,
        jenis: fileData.jenis,
        url: fileData.url,
      },
    });
  }

  async getStats() {
    const [
      totalPendaftar,
      diterima,
      ditolak,
      menunggu,
    ] = await Promise.all([
      prisma.pPDB.count(),
      prisma.pPDB.count({ where: { status: 'ACCEPTED' } }),
      prisma.pPDB.count({ where: { status: 'REJECTED' } }),
      prisma.pPDB.count({
        where: { status: { in: ['SUBMITTED', 'VERIFIED'] } },
      }),
    ]);

    // Per jurusan stats
    const perJurusan = await prisma.jurusan.findMany({
      include: {
        _count: {
          select: { ppdb: true },
        },
      },
    });

    return {
      totalPendaftar,
      diterima,
      ditolak,
      menunggu,
      perJurusan: perJurusan.map((j) => ({
        jurusan: j.nama,
        jumlah: j._count.ppdb,
      })),
    };
  }

  async exportData(filters: any) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.jurusanId) {
      where.jurusanId = filters.jurusanId;
    }

    const data = await prisma.pPDB.findMany({
      where,
      include: {
        jurusan: { select: { nama: true } },
        berkas: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return data;
  }

  private async generateNoPendaftaran(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await prisma.pPDB.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `PPDB${year}${sequence}`;
  }
}