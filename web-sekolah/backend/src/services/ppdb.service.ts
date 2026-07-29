// src/services/ppdb.service.ts
import { PPDBRepository } from '../repositories/ppdb.repository';
import { AppError } from '../utils/AppError';
import { uploadToCloudinary } from '../config/cloudinary';
import prisma from '../config/database';
import fs from 'fs/promises';
import * as XLSX from 'xlsx';

const ppdbRepository = new PPDBRepository();

export class PPDBService {
  async getInfo() {
    const [setting, jurusan, tahunAjaran] = await Promise.all([
      prisma.setting.findMany({
        where: { key: { in: ['ppdb_open', 'ppdb_year', 'ppdb_quota'] } },
      }),
      prisma.jurusan.findMany(),
      prisma.tahunAjaran.findFirst({ where: { isActive: true } }),
    ]);

    return {
      isOpen: setting.find((s) => s.key === 'ppdb_open')?.value === 'true',
      tahun: setting.find((s) => s.key === 'ppdb_year')?.value,
      kuota: setting.find((s) => s.key === 'ppdb_quota')?.value,
      jurusan,
      tahunAjaran,
    };
  }

  async register(data: any, files: Express.Multer.File[]) {
    const setting = await prisma.setting.findUnique({ where: { key: 'ppdb_open' } });
    if (setting?.value !== 'true') {
      throw new AppError('PPDB sedang ditutup', 400);
    }

    // Generate no pendaftaran
    const count = await prisma.pPDB.count();
    const noPendaftaran = `PPDB${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;

    const pendaftaran = await ppdbRepository.create({
      ...data,
      noPendaftaran,
      tanggalLahir: new Date(data.tanggalLahir),
      status: 'SUBMITTED',
    });

    // Upload berkas
    for (const file of files) {
      let url = '';
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(file.path, `ppdb/${pendaftaran.id}`);
        url = result.secure_url;
        await fs.unlink(file.path);
      } else {
        url = `/uploads/documents/${file.filename}`;
      }

      const jenis = file.fieldname.replace('_file', '').toUpperCase();
      await prisma.pPDBBerkas.create({
        data: {
          ppdbId: pendaftaran.id,
          nama: file.originalname,
          jenis,
          url,
        },
      });
    }

    return pendaftaran;
  }

  async checkStatus(noPendaftaran: string) {
    const pendaftaran = await ppdbRepository.findByNoPendaftaran(noPendaftaran);
    if (!pendaftaran) throw new AppError('Pendaftaran tidak ditemukan', 404);

    return {
      noPendaftaran: pendaftaran.noPendaftaran,
      nama: pendaftaran.namaLengkap,
      status: pendaftaran.status,
      jurusan: pendaftaran.jurusan.nama,
      catatan: pendaftaran.catatan,
    };
  }

  async getAll(options: any, filters: any) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { namaLengkap: { contains: filters.search, mode: 'insensitive' } },
        { noPendaftaran: { contains: filters.search } },
        { nisn: { contains: filters.search } },
      ];
    }

    if (filters.status) where.status = filters.status;
    if (filters.jurusanId) where.jurusanId = filters.jurusanId;

    return ppdbRepository.findAll(options, where);
  }

  async getById(id: string) {
    const pendaftaran = await ppdbRepository.findById(id);
    if (!pendaftaran) throw new AppError('Pendaftaran tidak ditemukan', 404);
    return pendaftaran;
  }

  async updateStatus(id: string, status: string, verifierId: string, catatan?: string) {
    return ppdbRepository.update(id, {
      status,
      catatan,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
    });
  }

  async verifyBerkas(berkasId: string, isVerified: boolean, catatan?: string) {
    return prisma.pPDBBerkas.update({
      where: { id: berkasId },
      data: { isVerified, catatan },
    });
  }

  async exportExcel(filters: any) {
    const data = await this.getAll({ page: 1, limit: 10000 }, filters);
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      data.items.map((s: any) => ({
        'No Pendaftaran': s.noPendaftaran,
        'Nama': s.namaLengkap,
        'NISN': s.nisn,
        'Asal Sekolah': s.asalSekolah,
        'Jurusan': s.jurusan.nama,
        'Status': s.status,
        'Tanggal Daftar': s.createdAt,
      }))
    );
    
    XLSX.utils.book_append_sheet(wb, ws, 'PPDB');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async getStats() {
    return prisma.pPDB.groupBy({
      by: ['status', 'jurusanId'],
      _count: true,
    });
  }
}