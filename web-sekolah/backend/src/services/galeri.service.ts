import { GaleriRepository } from '../repositories/galeri.repository';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../utils/pagination';
import { cacheGet, cacheSet, cacheDeletePattern } from '../config/redis';

const galeriRepository = new GaleriRepository();

export class GaleriService {
  async getAll(options: PaginationOptions, filters: any) {
    const cacheKey = `galeri:list:${JSON.stringify({ options, filters })}`;
    const cached = await cacheGet(cacheKey);

    if (cached) return JSON.parse(cached);

    const where: any = {};

    if (filters.tipe) {
      where.tipe = filters.tipe;
    }

    if (filters.albumId) {
      where.albumId = filters.albumId;
    }

    const result = await galeriRepository.findAll(options, where);
    await cacheSet(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  async getById(id: string) {
    const galeri = await galeriRepository.findById(id);
    if (!galeri) {
      throw new AppError('Galeri tidak ditemukan', 404);
    }
    return galeri;
  }

  async getByAlbum(albumId: string, options: PaginationOptions) {
    return galeriRepository.findByAlbum(albumId, options);
  }

  async create(data: any, userId: string) {
    const galeri = await galeriRepository.create({
      ...data,
      uploadedBy: userId,
    });

    await cacheDeletePattern('galeri:*');
    return galeri;
  }

  async createMany(items: any[], userId: string) {
    const data = items.map((item) => ({
      ...item,
      uploadedBy: userId,
    }));

    await galeriRepository.createMany(data);
    await cacheDeletePattern('galeri:*');
    return { message: `${items.length} item berhasil ditambahkan` };
  }

  async update(id: string, data: any) {
    const galeri = await galeriRepository.findById(id);
    if (!galeri) {
      throw new AppError('Galeri tidak ditemukan', 404);
    }

    const updated = await galeriRepository.update(id, data);
    await cacheDeletePattern('galeri:*');
    return updated;
  }

  async delete(id: string) {
    const galeri = await galeriRepository.findById(id);
    if (!galeri) {
      throw new AppError('Galeri tidak ditemukan', 404);
    }

    await galeriRepository.delete(id);
    await cacheDeletePattern('galeri:*');
    return { message: 'Item berhasil dihapus' };
  }

  // Album methods
  async getAllAlbums(options: PaginationOptions) {
    return galeriRepository.findAllAlbums(options);
  }

  async getAlbumBySlug(slug: string) {
    const album = await galeriRepository.findAlbumBySlug(slug);
    if (!album) {
      throw new AppError('Album tidak ditemukan', 404);
    }
    return album;
  }

  async createAlbum(data: any) {
    // Generate slug
    const slug = data.nama
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s]+/g, '-');

    return galeriRepository.createAlbum({ ...data, slug });
  }
}