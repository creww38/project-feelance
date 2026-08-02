import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class PengumumanRepository {
  private defaultInclude = {
    author: {
      select: { id: true, namaLengkap: true, foto: true },
    },
  };

  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.pengumuman.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: [
          { isPinned: 'desc' },
          { priority: 'desc' },
          { publishedAt: 'desc' },
        ],
      }),
      prisma.pengumuman.count({ where }),
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
    return prisma.pengumuman.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findPinned() {
    return prisma.pengumuman.findMany({
      where: {
        isPinned: true,
        status: 'PUBLISHED',
        OR: [
          { expiredAt: null },
          { expiredAt: { gte: new Date() } },
        ],
      },
      include: this.defaultInclude,
      orderBy: { priority: 'desc' },
    });
  }

  async findActive(options: PaginationOptions) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.pengumuman.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { expiredAt: null },
            { expiredAt: { gte: new Date() } },
          ],
        },
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: [
          { isPinned: 'desc' },
          { publishedAt: 'desc' },
        ],
      }),
      prisma.pengumuman.count({
        where: {
          status: 'PUBLISHED',
          OR: [{ expiredAt: null }, { expiredAt: { gte: new Date() } }],
        },
      }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(data: any) {
    return prisma.pengumuman.create({
      data,
      include: this.defaultInclude,
    });
  }

  async update(id: string, data: any) {
    return prisma.pengumuman.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: string) {
    return prisma.pengumuman.delete({
      where: { id },
    });
  }
}