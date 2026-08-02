// src/services/absensi.service.ts
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { PaginationOptions, paginate } from '../utils/pagination';
import QRCode from 'qrcode';
import { addHours, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export class AbsensiService {
  async getBySiswa(siswaId: string, options: PaginationOptions, filters: any) {
    const where: any = { siswaId };

    if (filters.tanggal) {
      const date = new Date(filters.tanggal);
      where.tanggal = {
        gte: startOfDay(date),
        lte: endOfDay(date),
      };
    }

    if (filters.bulan) {
      const [year, month] = filters.bulan.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      where.tanggal = {
        gte: startOfMonth(date),
        lte: endOfMonth(date),
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return prisma.absensi.findMany({
      where,
      include: {
        siswa: {
          select: {
            nis: true,
            user: {
              select: {
                namaLengkap: true,
                foto: true,
              },
            },
          },
        },
      },
      orderBy: { tanggal: 'desc' },
      skip: ((options.page || 1) - 1) * (options.limit || 10),
      take: options.limit || 10,
    });
  }

  async getByKelas(kelasId: string, tanggal: string) {
    const date = new Date(tanggal);

    const siswa = await prisma.siswa.findMany({
      where: { kelasId },
      select: {
        id: true,
        nis: true,
        user: {
          select: {
            namaLengkap: true,
            foto: true,
          },
        },
        absensi: {
          where: {
            tanggal: {
              gte: startOfDay(date),
              lte: endOfDay(date),
            },
          },
          select: {
            id: true,
            status: true,
            keterangan: true,
          },
        },
      },
    });

    return siswa.map((s) => ({
      siswaId: s.id,
      nis: s.nis,
      nama: s.user.namaLengkap,
      foto: s.user.foto,
      absensi: s.absensi[0] || null,
    }));
  }

  async record(siswaId: string, data: { status: string; keterangan?: string }) {
    const today = new Date();

    // Check if already recorded today
    const existing = await prisma.absensi.findFirst({
      where: {
        siswaId,
        tanggal: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    if (existing) {
      throw new AppError('Absensi hari ini sudah tercatat', 400);
    }

    return prisma.absensi.create({
      data: {
        siswaId,
        status: data.status as any,
        keterangan: data.keterangan,
        tanggal: today,
      },
    });
  }

  async recordByQR(qrData: string, lokasi?: { lat: number; lng: number }) {
    // QR data format: studentId:timestamp:hash
    const [siswaId, timestamp, hash] = qrData.split(':');

    // Validate QR
    const now = Date.now();
    const qrTime = parseInt(timestamp);
    
    if (now - qrTime > 300000) {
      // 5 minutes expiry
      throw new AppError('QR Code kadaluarsa', 400);
    }

    // Record attendance
    return this.record(siswaId, {
      status: 'HADIR',
    });
  }

  async generateQR(siswaId: string) {
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        user: { select: { namaLengkap: true } },
        kelas: { select: { nama: true } },
      },
    });

    if (!siswa) {
      throw new AppError('Siswa tidak ditemukan', 404);
    }

    const timestamp = Date.now().toString();
    const hash = Buffer.from(`${siswaId}:${timestamp}`).toString('base64');
    const qrData = `${siswaId}:${timestamp}:${hash}`;

    const qrCode = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff',
      },
    });

    return {
      qrCode,
      siswa: {
        id: siswa.id,
        nama: siswa.user.namaLengkap,
        nis: siswa.nis,
        kelas: siswa.kelas.nama,
      },
      expiresIn: 300, // 5 minutes
    };
  }

  async getRekap(kelasId: string, bulan: string) {
    const [year, month] = bulan.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const siswa = await prisma.siswa.findMany({
      where: { kelasId },
      include: {
        user: { select: { namaLengkap: true } },
        absensi: {
          where: {
            tanggal: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            tanggal: true,
            status: true,
          },
        },
      },
    });

    // Generate summary
    return siswa.map((s) => {
      const hadir = s.absensi.filter((a) => a.status === 'HADIR').length;
      const sakit = s.absensi.filter((a) => a.status === 'SAKIT').length;
      const izin = s.absensi.filter((a) => a.status === 'IZIN').length;
      const alpha = s.absensi.filter((a) => a.status === 'ALPHA').length;
      const total = hadir + sakit + izin + alpha;

      return {
        siswaId: s.id,
        nama: s.user.namaLengkap,
        nis: s.nis,
        hadir,
        sakit,
        izin,
        alpha,
        total,
        persentase: total > 0 ? ((hadir / total) * 100).toFixed(1) : 0,
      };
    });
  }

  async getStatistikSiswa(siswaId: string, semester: string) {
    const absensi = await prisma.absensi.findMany({
      where: { siswaId },
      orderBy: { tanggal: 'desc' },
    });

    const total = absensi.length;
    const hadir = absensi.filter((a) => a.status === 'HADIR').length;
    const sakit = absensi.filter((a) => a.status === 'SAKIT').length;
    const izin = absensi.filter((a) => a.status === 'IZIN').length;
    const alpha = absensi.filter((a) => a.status === 'ALPHA').length;

    return {
      total,
      hadir,
      sakit,
      izin,
      alpha,
      persentaseKehadiran: total > 0 ? ((hadir / total) * 100).toFixed(1) : 0,
      absensiTerbaru: absensi.slice(0, 10),
    };
  }
}