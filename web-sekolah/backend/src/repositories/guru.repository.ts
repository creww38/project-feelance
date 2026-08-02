import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class GuruRepository {
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
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    },
    waliKelas: {
      select: {
        id: true,
        nama: true,
        tingkat: true,
      },
    },
    mataPelajaran: {
      select: {
        id: true,
        kode: true,
        nama: true,
      },
    },
  };

  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.guru.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.guru.count({ where }),
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
    return prisma.guru.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findByUserId(userId: string) {
    return prisma.guru.findUnique({
      where: { userId },
      include: this.defaultInclude,
    });
  }

  async findByNip(nip: string) {
    return prisma.guru.findUnique({
      where: { nip },
      include: this.defaultInclude,
    });
  }

  async create(data: any) {
    return prisma.guru.create({
      data,
      include: this.defaultInclude,
    });
  }

  async update(id: string, data: any) {
    return prisma.guru.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: string) {
    return prisma.guru.delete({
      where: { id },
    });
  }

  async count() {
    return prisma.guru.count({
      where: { user: { isActive: true } },
    });
  }
}