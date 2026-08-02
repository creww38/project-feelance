import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export class AbsensiRepository {
  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.absensi.findMany({
        where,
        include: {
          siswa: {
            include: {
              user: { select: { namaLengkap: true, foto: true } },
              kelas: { select: { nama: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { tanggal: 'desc' },
      }),
      prisma.absensi.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findBySiswaAndDate(siswaId: string, date: Date) {
    return prisma.absensi.findFirst({
      where: {
        siswaId,
        tanggal: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    });
  }

  async findBySiswaAndMonth(siswaId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return prisma.absensi.findMany({
      where: {
        siswaId,
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { tanggal: 'asc' },
    });
  }

  async findByKelasAndDate(kelasId: string, date: Date) {
    return prisma.siswa.findMany({
      where: { kelasId },
      select: {
        id: true,
        nis: true,
        user: { select: { namaLengkap: true } },
        absensi: {
          where: {
            tanggal: {
              gte: startOfDay(date),
              lte: endOfDay(date),
            },
          },
        },
      },
    });
  }

  async create(data: any) {
    return prisma.absensi.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.absensi.update({
      where: { id },
      data,
    });
  }

  async getRekap(kelasId: string, startDate: Date, endDate: Date) {
    const siswa = await prisma.siswa.findMany({
      where: { kelasId },
      include: {
        user: { select: { namaLengkap: true } },
        absensi: {
          where: {
            tanggal: { gte: startDate, lte: endDate },
          },
        },
      },
    });

    return siswa.map((s) => ({
      siswaId: s.id,
      nis: s.nis,
      nama: s.user.namaLengkap,
      hadir: s.absensi.filter((a) => a.status === 'HADIR').length,
      sakit: s.absensi.filter((a) => a.status === 'SAKIT').length,
      izin: s.absensi.filter((a) => a.status === 'IZIN').length,
      alpha: s.absensi.filter((a) => a.status === 'ALPHA').length,
      terlambat: s.absensi.filter((a) => a.status === 'TERLAMBAT').length,
    }));
  }
}