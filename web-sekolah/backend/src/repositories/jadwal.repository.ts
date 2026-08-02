import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class JadwalRepository {
  private defaultInclude = {
    kelas: {
      select: { id: true, nama: true, tingkat: true },
    },
    mataPelajaran: {
      select: { id: true, kode: true, nama: true },
    },
    guru: {
      include: {
        user: { select: { namaLengkap: true } },
      },
    },
  };

  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.jadwal.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
      }),
      prisma.jadwal.count({ where }),
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

  async findById(id: string) {
    return prisma.jadwal.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findByKelas(kelasId: string) {
    return prisma.jadwal.findMany({
      where: { kelasId },
      include: this.defaultInclude,
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
    });
  }

  async findByGuru(guruId: string, hari?: string) {
    const where: any = { guruId };
    if (hari) where.hari = hari;

    return prisma.jadwal.findMany({
      where,
      include: this.defaultInclude,
      orderBy: { jamMulai: 'asc' },
    });
  }

  async findByHari(kelasId: string, hari: string) {
    return prisma.jadwal.findMany({
      where: { kelasId, hari: hari as any },
      include: this.defaultInclude,
      orderBy: { jamMulai: 'asc' },
    });
  }

  async create(data: any) {
    return prisma.jadwal.create({
      data,
      include: this.defaultInclude,
    });
  }

  async createMany(data: any[]) {
    return prisma.jadwal.createMany({ data });
  }

  async update(id: string, data: any) {
    return prisma.jadwal.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: string) {
    return prisma.jadwal.delete({ where: { id } });
  }

  async deleteByKelas(kelasId: string) {
    return prisma.jadwal.deleteMany({ where: { kelasId } });
  }
}