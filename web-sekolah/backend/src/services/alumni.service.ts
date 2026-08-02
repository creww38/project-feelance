import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../utils/pagination';

export class AlumniService {
  async getAll(options: PaginationOptions, filters: any) {
    const where: any = {};

    if (filters.tahunLulus) {
      where.tahunLulus = parseInt(filters.tahunLulus);
    }

    if (filters.jurusan) {
      where.jurusan = { contains: filters.jurusan, mode: 'insensitive' };
    }

    if (filters.search) {
      where.siswa = {
        user: { namaLengkap: { contains: filters.search, mode: 'insensitive' } },
      };
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.alumni.findMany({
        where,
        include: {
          siswa: {
            include: {
              user: { select: { namaLengkap: true, foto: true } },
              kelas: {
                include: { jurusan: { select: { nama: true } } },
              },
            },
          },
          tracerStudy: true,
        },
        skip,
        take: limit,
        orderBy: { tahunLulus: 'desc' },
      }),
      prisma.alumni.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const alumni = await prisma.alumni.findUnique({
      where: { id },
      include: {
        siswa: {
          include: {
            user: { select: { namaLengkap: true, foto: true } },
          },
        },
        tracerStudy: true,
      },
    });

    if (!alumni) {
      throw new AppError('Data alumni tidak ditemukan', 404);
    }

    return alumni;
  }

  async create(data: any) {
    const siswa = await prisma.siswa.findUnique({ where: { id: data.siswaId } });
    if (!siswa) {
      throw new AppError('Siswa tidak ditemukan', 404);
    }

    return prisma.alumni.create({
      data: {
        siswaId: data.siswaId,
        tahunLulus: data.tahunLulus,
        jurusan: data.jurusan,
        pekerjaan: data.pekerjaan,
        namaPerusahaan: data.namaPerusahaan,
        universitas: data.universitas,
        jurusanKuliah: data.jurusanKuliah,
        kontak: data.kontak,
        email: data.email,
        alamat: data.alamat,
      },
    });
  }

  async update(id: string, data: any) {
    const existing = await prisma.alumni.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Data alumni tidak ditemukan', 404);
    }

    return prisma.alumni.update({ where: { id }, data });
  }

  async delete(id: string) {
    const existing = await prisma.alumni.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Data alumni tidak ditemukan', 404);
    }

    await prisma.alumni.delete({ where: { id } });
    return { message: 'Data alumni berhasil dihapus' };
  }

  // Tracer Study
  async addTracerStudy(alumniId: string, data: any) {
    return prisma.tracerStudy.create({
      data: {
        alumniId,
        ...data,
      },
    });
  }

  async getStats() {
    const totalAlumni = await prisma.alumni.count();
    const perTahun = await prisma.alumni.groupBy({
      by: ['tahunLulus'],
      _count: { id: true },
      orderBy: { tahunLulus: 'desc' },
    });

    const tracerStats = await prisma.tracerStudy.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return { totalAlumni, perTahun, tracerStats };
  }
}