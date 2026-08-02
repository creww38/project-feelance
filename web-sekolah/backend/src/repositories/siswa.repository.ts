import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class SiswaRepository {
  private defaultInclude = {
    user: {
      select: {
        id: true,
        email: true,
        username: true,
        namaLengkap: true,
        foto: true,
        noTelp: true,
        alamat: true,
        jenisKelamin: true,
        isActive: true,
      },
    },
    kelas: {
      include: {
        jurusan: {
          select: { id: true, kode: true, nama: true },
        },
        tahunAjaran: {
          select: { id: true, nama: true },
        },
      },
    },
    orangTua: {
      include: {
        user: {
          select: { id: true, namaLengkap: true, noTelp: true },
        },
      },
    },
  };

  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.siswa.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.siswa.count({ where }),
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
    return prisma.siswa.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findByUserId(userId: string) {
    return prisma.siswa.findUnique({
      where: { userId },
      include: this.defaultInclude,
    });
  }

  async findByNis(nis: string) {
    return prisma.siswa.findUnique({
      where: { nis },
      include: this.defaultInclude,
    });
  }

  async findByNisn(nisn: string) {
    return prisma.siswa.findUnique({
      where: { nisn },
      include: this.defaultInclude,
    });
  }

  async findByKelas(kelasId: string) {
    return prisma.siswa.findMany({
      where: { kelasId },
      include: this.defaultInclude,
      orderBy: { user: { namaLengkap: 'asc' } },
    });
  }

  async create(data: any) {
    return prisma.siswa.create({
      data,
      include: this.defaultInclude,
    });
  }

  async update(id: string, data: any) {
    return prisma.siswa.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: string) {
    return prisma.siswa.delete({
      where: { id },
    });
  }

  async count() {
    return prisma.siswa.count();
  }

  async countByKelas(kelasId: string) {
    return prisma.siswa.count({ where: { kelasId } });
  }
}