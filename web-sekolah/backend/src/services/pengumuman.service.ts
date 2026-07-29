// src/services/pengumuman.service.ts
import { PengumumanRepository } from '../repositories/pengumuman.repository';
import { AppError } from '../utils/AppError';
import { uploadToCloudinary } from '../config/cloudinary';
import fs from 'fs/promises';

const pengumumanRepository = new PengumumanRepository();

export class PengumumanService {
  async getAll(options: any, filters: any) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { judul: { contains: filters.search, mode: 'insensitive' } },
        { konten: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.status) where.status = filters.status;

    return pengumumanRepository.findAll(options, where);
  }

  async getById(id: string) {
    const pengumuman = await pengumumanRepository.findById(id);
    if (!pengumuman) throw new AppError('Pengumuman tidak ditemukan', 404);
    return pengumuman;
  }

  async getPinned() {
    return pengumumanRepository.findPinned();
  }

  async create(data: any, authorId: string, file?: Express.Multer.File) {
    let lampiran = null;

    if (file) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(file.path, 'pengumuman');
        lampiran = result.secure_url;
        await fs.unlink(file.path);
      } else {
        lampiran = `/uploads/documents/${file.filename}`;
      }
    }

    return pengumumanRepository.create({
      ...data,
      lampiran,
      authorId,
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
    });
  }

  async update(id: string, data: any, file?: Express.Multer.File) {
    const pengumuman = await pengumumanRepository.findById(id);
    if (!pengumuman) throw new AppError('Pengumuman tidak ditemukan', 404);

    const updateData: any = { ...data };

    if (file) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(file.path, 'pengumuman');
        updateData.lampiran = result.secure_url;
        await fs.unlink(file.path);
      } else {
        updateData.lampiran = `/uploads/documents/${file.filename}`;
      }
    }

    if (data.status === 'PUBLISHED' && !pengumuman.publishedAt) {
      updateData.publishedAt = new Date();
    }

    return pengumumanRepository.update(id, updateData);
  }

  async delete(id: string) {
    await pengumumanRepository.delete(id);
  }

  async togglePin(id: string) {
    const pengumuman = await pengumumanRepository.findById(id);
    if (!pengumuman) throw new AppError('Pengumuman tidak ditemukan', 404);

    return pengumumanRepository.update(id, {
      isPinned: !pengumuman.isPinned,
    });
  }
}