import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class TugasRepository {
  private defaultInclude = {
    mataPelajaran: { select: { id: true, nama: true } },
    guru: {
      include: { user: { select: { namaLengkap: true } } },
    },
    kelas: { select: { id: true, nama: true } },
    _count: { select: { jawaban: true } },
  };

  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.tugas.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tugas.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    return prisma.tugas.findUnique({
      where: { id },
      include: {
        ...this.defaultInclude,
        jawaban: {
          include: {
            siswa: {
              include: { user: { select: { namaLengkap: true } } },
            },
          },
        },
      },
    });
  }

  async findBySiswa(siswaId: string, options: PaginationOptions) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.tugas.findMany({
        where: {
          jawaban: { none: { siswaId } },
          deadline: { gte: new Date() },
        },
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { deadline: 'asc' },
      }),
      prisma.tugas.count({
        where: {
          jawaban: { none: { siswaId } },
          deadline: { gte: new Date() },
        },
      }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(data: any) {
    return prisma.tugas.create({ data, include: this.defaultInclude });
  }

  async update(id: string, data: any) {
    return prisma.tugas.update({ where: { id }, data, include: this.defaultInclude });
  }

  async delete(id: string) {
    return prisma.tugas.delete({ where: { id } });
  }

  // Jawaban methods
  async submitJawaban(data: any) {
    return prisma.jawabanTugas.create({ data });
  }

  async findJawabanByTugas(tugasId: string) {
    return prisma.jawabanTugas.findMany({
      where: { tugasId },
      include: {
        siswa: {
          include: { user: { select: { namaLengkap: true } } },
        },
      },
    });
  }

  async updateJawaban(id: string, data: any) {
    return prisma.jawabanTugas.update({ where: { id }, data });
  }
}