// src/services/eLearning.service.ts
import { MateriRepository } from '../repositories/materi.repository';
import { TugasRepository } from '../repositories/tugas.repository';
import { AppError } from '../utils/AppError';
import { uploadToCloudinary } from '../config/cloudinary';
import prisma from '../config/database';
import fs from 'fs/promises';

const materiRepository = new MateriRepository();
const tugasRepository = new TugasRepository();

export class ELearningService {
  // Materi
  async getAllMateri(filters: any) {
    const where: any = {};
    if (filters.mataPelajaranId) where.mataPelajaranId = filters.mataPelajaranId;
    if (filters.kelasId) where.kelasId = filters.kelasId;
    if (filters.search) {
      where.OR = [
        { judul: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return materiRepository.findAll(where);
  }

  async getMateriById(id: string) {
    const materi = await materiRepository.findById(id);
    if (!materi) throw new AppError('Materi tidak ditemukan', 404);
    return materi;
  }

  async createMateri(data: any, file?: Express.Multer.File, userId?: string) {
    let fileUrl = null;
    if (file) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(file.path, 'materi');
        fileUrl = result.secure_url;
        await fs.unlink(file.path);
      } else {
        fileUrl = `/uploads/documents/${file.filename}`;
      }
    }

    const guru = await prisma.guru.findUnique({ where: { userId } });
    return materiRepository.create({
      ...data,
      fileUrl,
      guruId: guru?.id,
    });
  }

  async updateMateri(id: string, data: any, file?: Express.Multer.File) {
    const updateData: any = { ...data };
    if (file) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(file.path, 'materi');
        updateData.fileUrl = result.secure_url;
        await fs.unlink(file.path);
      } else {
        updateData.fileUrl = `/uploads/documents/${file.filename}`;
      }
    }
    return materiRepository.update(id, updateData);
  }

  async deleteMateri(id: string) {
    await materiRepository.delete(id);
  }

  // Tugas
  async getAllTugas(filters: any) {
    const where: any = {};
    if (filters.mataPelajaranId) where.mataPelajaranId = filters.mataPelajaranId;
    if (filters.kelasId) where.kelasId = filters.kelasId;
    return tugasRepository.findAll(where);
  }

  async getTugasById(id: string) {
    const tugas = await tugasRepository.findById(id);
    if (!tugas) throw new AppError('Tugas tidak ditemukan', 404);
    return tugas;
  }

  async createTugas(data: any, file?: Express.Multer.File, userId?: string) {
    const guru = await prisma.guru.findUnique({ where: { userId } });
    return tugasRepository.create({
      ...data,
      deadline: new Date(data.deadline),
      guruId: guru?.id,
      fileUrl: file?.path ? `/uploads/documents/${file.filename}` : null,
    });
  }

  async updateTugas(id: string, data: any, file?: Express.Multer.File) {
    const updateData: any = { ...data };
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    if (file) updateData.fileUrl = `/uploads/documents/${file.filename}`;
    return tugasRepository.update(id, updateData);
  }

  async deleteTugas(id: string) {
    await tugasRepository.delete(id);
  }

  async submitJawaban(tugasId: string, data: any, file?: Express.Multer.File, userId?: string) {
    const siswa = await prisma.siswa.findUnique({ where: { userId } });
    if (!siswa) throw new AppError('Siswa tidak ditemukan', 404);

    const tugas = await tugasRepository.findById(tugasId);
    if (!tugas) throw new AppError('Tugas tidak ditemukan', 404);

    if (new Date() > tugas.deadline) {
      throw new AppError('Tugas sudah melewati deadline', 400);
    }

    return prisma.jawabanTugas.create({
      data: {
        tugasId,
        siswaId: siswa.id,
        konten: data.konten,
        fileUrl: file?.path ? `/uploads/documents/${file.filename}` : null,
        status: 'SUBMITTED',
      },
    });
  }

  async gradeJawaban(jawabanId: string, nilai: number, komentar?: string) {
    return prisma.jawabanTugas.update({
      where: { id: jawabanId },
      data: {
        nilai,
        komentar,
        status: 'GRADED',
        gradedAt: new Date(),
      },
    });
  }
}