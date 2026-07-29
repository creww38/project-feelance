// src/services/dashboard.service.ts
import prisma from '../config/database';
import { startOfWeek, startOfMonth, startOfYear, format } from 'date-fns';

export class DashboardService {
  async getAdminStats() {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const yearStart = startOfYear(now);

    const [
      totalGuru,
      totalSiswa,
      totalStaff,
      totalBerita,
      totalGaleri,
      totalPengumuman,
      totalAgenda,
      totalAlumni,
      ppdbStats,
      visitorData,
      siswaData,
    ] = await Promise.all([
      prisma.guru.count({ where: { user: { isActive: true } } }),
      prisma.siswa.count(),
      prisma.user.count({
        where: {
          userRoles: {
            some: { role: { nama: 'STAFF_TU' } },
          },
        },
      }),
      prisma.berita.count(),
      prisma.galeri.count(),
      prisma.pengumuman.count(),
      prisma.agenda.count(),
      prisma.alumni.count(),
      this.getPPDBStats(),
      this.getVisitorStats(),
      this.getSiswaStats(),
    ]);

    return {
      totalGuru,
      totalSiswa,
      totalStaff,
      totalBerita,
      totalGaleri,
      totalPengumuman,
      totalAgenda,
      totalAlumni,
      totalPengunjung: 0, // Will be implemented with analytics
      ppdbStats,
      visitorChart: visitorData,
      siswaChart: siswaData,
    };
  }

  async getKepsekStats() {
    const [totalGuru, totalSiswa, totalStaff, ppdbStats] = await Promise.all([
      prisma.guru.count(),
      prisma.siswa.count(),
      prisma.user.count({
        where: {
          userRoles: {
            some: { role: { nama: 'STAFF_TU' } },
          },
        },
      }),
      this.getPPDBStats(),
    ]);

    return { totalGuru, totalSiswa, totalStaff, ppdbStats };
  }

  async getGuruStats(guruId: string) {
    const [jadwalHariIni, totalMateri, totalTugas, siswaWali] =
      await Promise.all([
        prisma.jadwal.count({
          where: {
            guruId,
            hari: this.getTodayDay(),
          },
        }),
        prisma.materi.count({ where: { guruId } }),
        prisma.tugas.count({ where: { guruId } }),
        prisma.kelas.count({ where: { waliKelasId: guruId } }),
      ]);

    return { jadwalHariIni, totalMateri, totalTugas, siswaWali };
  }

  async getSiswaStats(siswaId: string) {
    const [jadwalHariIni, tugasPending, absensi] = await Promise.all([
      prisma.jadwal.count({
        where: {
          kelas: { siswa: { some: { id: siswaId } } },
          hari: this.getTodayDay(),
        },
      }),
      prisma.tugas.count({
        where: {
          kelas: { siswa: { some: { id: siswaId } } },
          deadline: { gte: new Date() },
          jawaban: { none: { siswaId } },
        },
      }),
      prisma.absensi.count({
        where: {
          siswaId,
          tanggal: { gte: startOfMonth(new Date()) },
        },
      }),
    ]);

    return { jadwalHariIni, tugasPending, absensi };
  }

  async getOrangTuaStats(siswaId: string) {
    const [absensi, nilaiRata, tugasPending] = await Promise.all([
      prisma.absensi.findMany({
        where: { siswaId },
        orderBy: { tanggal: 'desc' },
        take: 5,
      }),
      prisma.nilai.aggregate({
        where: { siswaId },
        _avg: { nilaiAkhir: true },
      }),
      prisma.jawabanTugas.count({
        where: { siswaId, nilai: null },
      }),
    ]);

    return {
      absensiTerbaru: absensi,
      nilaiRata: nilaiRata._avg.nilaiAkhir || 0,
      tugasPending,
    };
  }

  private async getPPDBStats() {
    const [pendaftar, diterima, ditolak, pending] = await Promise.all([
      prisma.pPDB.count(),
      prisma.pPDB.count({ where: { status: 'ACCEPTED' } }),
      prisma.pPDB.count({ where: { status: 'REJECTED' } }),
      prisma.pPDB.count({
        where: { status: { in: ['DRAFT', 'SUBMITTED', 'VERIFIED'] } },
      }),
    ]);

    return { pendaftar, diterima, ditolak, pending };
  }

  private async getVisitorStats() {
    const days = 7;
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(format(date, 'dd MMM'));

      // Get visitor count from log or analytics
      const count = await prisma.logAktivitas.count({
        where: {
          createdAt: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
      });

      data.push(count);
    }

    return { labels, data };
  }

  private async getSiswaStats() {
    const tahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
    });

    if (!tahunAjaran) return { labels: [], data: [] };

    const kelas = await prisma.kelas.findMany({
      where: { tahunAjaranId: tahunAjaran.id },
      include: { _count: { select: { siswa: true } } },
      orderBy: { nama: 'asc' },
    });

    return {
      labels: kelas.map((k) => k.nama),
      data: kelas.map((k) => k._count.siswa),
    };
  }

  private getTodayDay() {
    const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    return days[new Date().getDay()];
  }
}