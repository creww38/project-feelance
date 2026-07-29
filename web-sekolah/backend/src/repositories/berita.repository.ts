// src/repositories/berita.repository.ts
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class BeritaRepository {
  async findAll(options: any, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.berita.findMany({
        where,
        include: {
          kategori: { select: { id: true, nama: true, slug: true } },
          author: { select: { id: true, namaLengkap: true, foto: true } },
          tags: { include: { tag: true } },
          _count: { select: { komentar: true, likes: true } },
        },
        skip,
        take: limit,
        orderBy: options.sortBy
          ? { [options.sortBy]: options.sortOrder || 'desc' }
          : { publishedAt: 'desc' },
      }),
      prisma.berita.count({ where }),
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
    return prisma.berita.findUnique({
      where: { id },
      include: {
        kategori: true,
        author: {
          select: { id: true, namaLengkap: true, foto: true },
        },
        tags: { include: { tag: true } },
        _count: { select: { komentar: true, likes: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.berita.findUnique({
      where: { slug },
      include: {
        kategori: true,
        author: {
          select: { id: true, namaLengkap: true, foto: true },
        },
        tags: { include: { tag: true } },
        _count: { select: { komentar: true, likes: true } },
      },
    });
  }

  async create(data: any) {
    return prisma.berita.create({
      data: {
        judul: data.judul,
        slug: data.slug,
        konten: data.konten,
        ringkasan: data.ringkasan,
        gambar: data.gambar,
        status: data.status,
        isFeatured: data.isFeatured,
        authorId: data.authorId,
        kategoriId: data.kategoriId,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        tags: data.tagIds
          ? {
              create: data.tagIds.map((tagId: string) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        kategori: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.berita.update({
      where: { id },
      data: {
        ...data,
        publishedAt:
          data.status === 'PUBLISHED' && !data.publishedAt
            ? new Date()
            : data.publishedAt,
        tags: data.tagIds
          ? {
              deleteMany: {},
              create: data.tagIds.map((tagId: string) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        kategori: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.berita.delete({ where: { id } });
  }

  async incrementView(slug: string) {
    return prisma.berita.update({
      where: { slug },
      data: { viewedCount: { increment: 1 } },
    });
  }

  async toggleLike(beritaId: string, userId: string) {
    const existing = await prisma.beritaLike.findUnique({
      where: {
        beritaId_userId: { beritaId, userId },
      },
    });

    if (existing) {
      await prisma.beritaLike.delete({
        where: { id: existing.id },
      });
      return { liked: false };
    } else {
      await prisma.beritaLike.create({
        data: { beritaId, userId },
      });
      return { liked: true };
    }
  }

  async findFeatured() {
    return prisma.berita.findMany({
      where: {
        isFeatured: true,
        status: 'PUBLISHED',
      },
      include: {
        kategori: { select: { id: true, nama: true, slug: true } },
        author: { select: { id: true, namaLengkap: true, foto: true } },
      },
      take: 5,
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findTrending() {
    return prisma.berita.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewedCount: 'desc' },
      take: 5,
      include: {
        kategori: { select: { id: true, nama: true, slug: true } },
        author: { select: { id: true, namaLengkap: true, foto: true } },
      },
    });
  }

  async findRelated(kategoriId: string, excludeId: string) {
    return prisma.berita.findMany({
      where: {
        kategoriId,
        id: { not: excludeId },
        status: 'PUBLISHED',
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    });
  }
}