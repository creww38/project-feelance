// src/services/eLearning.service.ts
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../utils/pagination';

export class ELearningService {
  // MATERI
  async getMateri(options: PaginationOptions, filters: any) {
    const where: any = {};

    if (filters.mataPelajaranId) {
      where.mataPelajaranId = filters.mataPelajaranId;
    }

    if (filters.guruId) {
      where.guruId = filters.guruId;
    }

    if (filters.kelasId) {
      where.kelasId = filters.kelasId;
    }

    if (filters.search) {
      where.judul = { contains: filters.search, mode: 'insensitive' };
    }

    const page = options.page || 1;
    const limit = options.limit || 10;

    const [items, total] = await Promise.all([
      prisma.materi.findMany({
        where,
        include: {
          mataPelajaran: { select: { nama: true } },
          guru: {
            include: { user: { select: { namaLengkap: true } } },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.materi.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getMateriById(id: string) {
    const materi = await prisma.materi.findUnique({
      where: { id },
      include: {
        mataPelajaran: true,
        guru: {
          include: { user: { select: { namaLengkap: true } } },
        },
      },
    });

    if (!materi) {
      throw new AppError('Materi tidak ditemukan', 404);
    }

    return materi;
  }

  async createMateri(data: any) {
    return prisma.materi.create({ data });
  }

  async updateMateri(id: string, data: any) {
    const existing = await prisma.materi.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Materi tidak ditemukan', 404);
    }

    return prisma.materi.update({ where: { id }, data });
  }

  async deleteMateri(id: string) {
    const existing = await prisma.materi.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Materi tidak ditemukan', 404);
    }

    return prisma.materi.delete({ where: { id } });
  }

  // TUGAS
  async getTugas(options: PaginationOptions, filters: any) {
    const where: any = {};

    if (filters.mataPelajaranId) {
      where.mataPelajaranId = filters.mataPelajaranId;
    }

    if (filters.guruId) {
      where.guruId = filters.guruId;
    }

    if (filters.kelasId) {
      where.kelasId = filters.kelasId;
    }

    const page = options.page || 1;
    const limit = options.limit || 10;

    const [items, total] = await Promise.all([
      prisma.tugas.findMany({
        where,
        include: {
          mataPelajaran: { select: { nama: true } },
          guru: {
            include: { user: { select: { namaLengkap: true } } },
          },
          _count: { select: { jawaban: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tugas.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getTugasById(id: string) {
    const tugas = await prisma.tugas.findUnique({
      where: { id },
      include: {
        mataPelajaran: true,
        guru: {
          include: { user: { select: { namaLengkap: true } } },
        },
        jawaban: {
          include: {
            siswa: {
              include: { user: { select: { namaLengkap: true } } },
            },
          },
        },
      },
    });

    if (!tugas) {
      throw new AppError('Tugas tidak ditemukan', 404);
    }

    return tugas;
  }

  async createTugas(data: any) {
    return prisma.tugas.create({ data });
  }

  async updateTugas(id: string, data: any) {
    const existing = await prisma.tugas.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Tugas tidak ditemukan', 404);
    }

    return prisma.tugas.update({ where: { id }, data });
  }

  async deleteTugas(id: string) {
    const existing = await prisma.tugas.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Tugas tidak ditemukan', 404);
    }

    return prisma.tugas.delete({ where: { id } });
  }

  // JAWABAN TUGAS
  async submitJawaban(tugasId: string, siswaId: string, data: any) {
    // Check if tugas exists and not past deadline
    const tugas = await prisma.tugas.findUnique({
      where: { id: tugasId },
      include: {
        jawaban: {
          where: { siswaId },
        },
      },
    });

    if (!tugas) {
      throw new AppError('Tugas tidak ditemukan', 404);
    }

    if (new Date() > tugas.deadline) {
      throw new AppError('Tugas sudah melewati deadline', 400);
    }

    if (tugas.jawaban.length > 0) {
      return prisma.jawabanTugas.update({
        where: { id: tugas.jawaban[0].id },
        data: {
          konten: data.konten,
          fileUrl: data.fileUrl,
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });
    }

    return prisma.jawabanTugas.create({
      data: {
        tugasId,
        siswaId,
        konten: data.konten,
        fileUrl: data.fileUrl,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
  }

  async nilaiJawaban(jawabanId: string, data: { nilai: number; komentar?: string }) {
    const jawaban = await prisma.jawabanTugas.findUnique({
      where: { id: jawabanId },
    });

    if (!jawaban) {
      throw new AppError('Jawaban tidak ditemukan', 404);
    }

    return prisma.jawabanTugas.update({
      where: { id: jawabanId },
      data: {
        nilai: data.nilai,
        komentar: data.komentar,
        status: 'GRADED',
        gradedAt: new Date(),
      },
    });
  }

  async getJawabanByTugas(tugasId: string) {
    return prisma.jawabanTugas.findMany({
      where: { tugasId },
      include: {
        siswa: {
          include: { user: { select: { namaLengkap: true, foto: true } } },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }
}