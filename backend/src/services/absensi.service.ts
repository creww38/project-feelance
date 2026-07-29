// src/services/absensi.service.ts
import { AbsensiRepository } from '../repositories/absensi.repository';
import { AppError } from '../utils/AppError';
import prisma from '../config/database';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const absensiRepository = new AbsensiRepository();

export class AbsensiService {
  async getByDate(kelasId: string, tanggal: Date) {
    const siswa = await prisma.siswa.findMany({
      where: { kelasId, status: 'AKTIF' },
      include: {
        user: { select: { id: true, namaLengkap: true } },
        absensi: {
          where: {
            tanggal: {
              gte: new Date(tanggal.setHours(0, 0, 0, 0)),
              lt: new Date(tanggal.setHours(23, 59, 59, 999)),
            },
          },
        },
      },
    });

    return siswa.map((s) => ({
      siswaId: s.id,
      nama: s.user.namaLengkap,
      nis: s.nis,
      absensi: s.absensi[0] || null,
    }));
  }

  async record(data: any, userId: string) {
    return absensiRepository.create({
      ...data,
      tanggal: data.tanggal ? new Date(data.tanggal) : new Date(),
    });
  }

  async recordBulk(absensiData: any[]) {
    const results = [];
    for (const data of absensiData) {
      const record = await absensiRepository.create({
        ...data,
        tanggal: new Date(),
      });
      results.push(record);
    }
    return results;
  }

  async getBySiswa(siswaId: string, bulan?: number, tahun?: number) {
    const now = new Date();
    const targetMonth = bulan || now.getMonth() + 1;
    const targetYear = tahun || now.getFullYear();

    return absensiRepository.findBySiswa(siswaId, targetMonth, targetYear);
  }

  async getRekap(kelasId: string, bulan?: number, tahun?: number) {
    const now = new Date();
    const targetMonth = bulan || now.getMonth() + 1;
    const targetYear = tahun || now.getFullYear();

    return absensiRepository.findRekap(kelasId, targetMonth, targetYear);
  }

  async generateQR(kelasId: string, tanggal: Date) {
    const token = uuidv4();
    const qrData = JSON.stringify({
      kelasId,
      tanggal: tanggal.toISOString().split('T')[0],
      token,
    });

    const qrCode = await QRCode.toDataURL(qrData);
    return { qrCode, token };
  }

  async scanQR(qrData: string, userId: string) {
    const data = JSON.parse(qrData);
    
    const siswa = await prisma.siswa.findFirst({
      where: {
        userId,
        kelasId: data.kelasId,
        status: 'AKTIF',
      },
    });

    if (!siswa) throw new AppError('Siswa tidak ditemukan di kelas ini', 400);

    // Check if already absen
    const existing = await prisma.absensi.findFirst({
      where: {
        siswaId: siswa.id,
        tanggal: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existing) throw new AppError('Anda sudah melakukan absensi hari ini', 400);

    return absensiRepository.create({
      siswaId: siswa.id,
      status: 'HADIR',
      qrCode: data.token,
    });
  }

  async exportPDF(kelasId: string, bulan?: number, tahun?: number) {
    // Implementasi PDF generation dengan library seperti PDFKit
    // Placeholder
    return Buffer.from('PDF Generation placeholder');
  }
}