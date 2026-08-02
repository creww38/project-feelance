import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class GaleriRepository {
  private defaultInclude = {
    album: {
      select: { id: true, nama: true, slug: true },
    },
    uploader: {
      select: { id: true, namaLengkap: true },
    },
  };

  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.galeri.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.galeri.count({ where }),
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
    return prisma.galeri.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findByAlbum(albumId: string, options: PaginationOptions) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.galeri.findMany({
        where: { albumId },
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.galeri.count({ where: { albumId } }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: any) {
    return prisma.galeri.create({
      data,
      include: this.defaultInclude,
    });
  }

  async createMany(data: any[]) {
    return prisma.galeri.createMany({
      data,
    });
  }

  async update(id: string, data: any) {
    return prisma.galeri.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: string) {
    return prisma.galeri.delete({
      where: { id },
    });
  }

  // Album methods
  async findAllAlbums(options: PaginationOptions) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.album.findMany({
        include: {
          _count: { select: { galeri: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.album.count(),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAlbumBySlug(slug: string) {
    return prisma.album.findUnique({
      where: { slug },
      include: {
        galeri: {
          include: this.defaultInclude,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { galeri: true } },
      },
    });
  }

  async createAlbum(data: any) {
    return prisma.album.create({ data });
  }
}