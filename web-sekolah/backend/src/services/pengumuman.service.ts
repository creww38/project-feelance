import { PengumumanRepository } from '../repositories/pengumuman.repository';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../utils/pagination';
import { cacheGet, cacheSet, cacheDeletePattern } from '../config/redis';

const pengumumanRepository = new PengumumanRepository();

export class PengumumanService {
  async getAll(options: PaginationOptions, filters: any) {
    const where: any = {};

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

    return pengumumanRepository.findAll(options, where);
  }

  async getActive(options: PaginationOptions) {
    const cacheKey = `pengumuman:active:${JSON.stringify(options)}`;
    const cached = await cacheGet(cacheKey);

    if (cached) return JSON.parse(cached);

    const result = await pengumumanRepository.findActive(options);
    await cacheSet(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  async getPinned() {
    const cacheKey = 'pengumuman:pinned';
    const cached = await cacheGet(cacheKey);

    if (cached) return JSON.parse(cached);

    const result = await pengumumanRepository.findPinned();
    await cacheSet(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  async getById(id: string) {
    const pengumuman = await pengumumanRepository.findById(id);
    if (!pengumuman) {
      throw new AppError('Pengumuman tidak ditemukan', 404);
    }
    return pengumuman;
  }

  async create(data: any, authorId: string) {
    const pengumuman = await pengumumanRepository.create({
      ...data,
      authorId,
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
    });

    await cacheDeletePattern('pengumuman:*');
    return pengumuman;
  }

  async update(id: string, data: any) {
    const existing = await pengumumanRepository.findById(id);
    if (!existing) {
      throw new AppError('Pengumuman tidak ditemukan', 404);
    }

    const updated = await pengumumanRepository.update(id, data);
    await cacheDeletePattern('pengumuman:*');
    return updated;
  }

  async delete(id: string) {
    const existing = await pengumumanRepository.findById(id);
    if (!existing) {
      throw new AppError('Pengumuman tidak ditemukan', 404);
    }

    await pengumumanRepository.delete(id);
    await cacheDeletePattern('pengumuman:*');
    return { message: 'Pengumuman berhasil dihapus' };
  }

  async togglePin(id: string) {
    const existing = await pengumumanRepository.findById(id);
    if (!existing) {
      throw new AppError('Pengumuman tidak ditemukan', 404);
    }

    const updated = await pengumumanRepository.update(id, {
      isPinned: !existing.isPinned,
    });

    await cacheDeletePattern('pengumuman:*');
    return updated;
  }
}