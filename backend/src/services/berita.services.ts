// src/services/berita.service.ts
import { BeritaRepository } from '../repositories/berita.repository';
import { generateSlug } from '../utils/slug';
import { cacheGet, cacheSet, cacheDeletePattern } from '../config/redis';
import { AppError } from '../utils/AppError';

const beritaRepository = new BeritaRepository();

export class BeritaService {
  async getAll(options: any, filters: any) {
    const cacheKey = `berita:list:${JSON.stringify({ options, filters })}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const where: any = {};

    if (filters.kategori) {
      where.kategori = { slug: filters.kategori };
    }

    if (filters.status) {
      where.status = filters.status;
    } else {
      where.status = 'PUBLISHED';
    }

    if (filters.search) {
      where.OR = [
        { judul: { contains: filters.search, mode: 'insensitive' } },
        { konten: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tag) {
      where.tags = {
        some: {
          tag: { slug: filters.tag },
        },
      };
    }

    const result = await beritaRepository.findAll(options, where);

    await cacheSet(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  async getBySlug(slug: string) {
    const cacheKey = `berita:detail:${slug}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const berita = await beritaRepository.findBySlug(slug);

    if (!berita) {
      throw new AppError('Berita tidak ditemukan', 404);
    }

    // Increment view count
    await beritaRepository.incrementView(slug);

    // Get related posts
    const related = await beritaRepository.findRelated(berita.kategoriId, berita.id);

    const result = { ...berita, related };

    await cacheSet(cacheKey, JSON.stringify(result), 600);
    return result;
  }

  async create(data: any, authorId: string) {
    const slug = await this.generateUniqueSlug(data.judul);

    const berita = await beritaRepository.create({
      ...data,
      slug,
      authorId,
      status: data.status || 'DRAFT',
    });

    await cacheDeletePattern('berita:*');
    return berita;
  }

  async update(id: string, data: any) {
    const existing = await beritaRepository.findById(id);

    if (!existing) {
      throw new AppError('Berita tidak ditemukan', 404);
    }

    if (data.judul && data.judul !== existing.judul) {
      data.slug = await this.generateUniqueSlug(data.judul);
    }

    const berita = await beritaRepository.update(id, data);

    await cacheDeletePattern('berita:*');
    return berita;
  }

  async delete(id: string) {
    const existing = await beritaRepository.findById(id);

    if (!existing) {
      throw new AppError('Berita tidak ditemukan', 404);
    }

    await beritaRepository.delete(id);
    await cacheDeletePattern('berita:*');
  }

  async toggleLike(beritaId: string, userId: string) {
    const result = await beritaRepository.toggleLike(beritaId, userId);
    return result;
  }

  async getFeatured() {
    const cacheKey = 'berita:featured';
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await beritaRepository.findFeatured();

    await cacheSet(cacheKey, JSON.stringify(result), 600);
    return result;
  }

  async getTrending() {
    const cacheKey = 'berita:trending';
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await beritaRepository.findTrending();

    await cacheSet(cacheKey, JSON.stringify(result), 600);
    return result;
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    let slug = generateSlug(title);
    let counter = 1;

    while (true) {
      const exists = await beritaRepository.findBySlug(slug);
      if (!exists) break;

      slug = `${generateSlug(title)}-${counter}`;
      counter++;
    }

    return slug;
  }
}