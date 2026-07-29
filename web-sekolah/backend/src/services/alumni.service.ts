// src/services/alumni.service.ts
import { AlumniRepository } from '../repositories/alumni.repository';
import { AppError } from '../utils/AppError';
import prisma from '../config/database';

const alumniRepository = new AlumniRepository();

export class AlumniService {
  async getAll(options: any, filters: any) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { siswa: { user: { namaLengkap: { contains: filters.search, mode: 'insensitive' } } } },
        { pekerjaan: { contains: filters.search, mode: 'insensitive' } },
        { universitas: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tahunLulus) where.tahunLulus = filters.tahunLulus;
    if (filters.jurusan) where.jurusan = filters.jurusan;

    return alumniRepository.findAll(options, where);
  }

  async getById(id: string) {
    const alumni = await alumniRepository.findById(id);
    if (!alumni) throw new AppError('Alumni tidak ditemukan', 404);
    return alumni;
  }

  async create(data: any) {
    return alumniRepository.create(data);
  }

  async update(id: string, data: any) {
    await alumniRepository.findById(id);
    return alumniRepository.update(id, data);
  }

  async delete(id: string) {
    await alumniRepository.delete(id);
  }

  async getTracerStudy(alumniId: string) {
    return prisma.tracerStudy.findMany({
      where: { alumniId },
      orderBy: { tahun: 'desc' },
    });
  }

  async addTracerStudy(alumniId: string, data: any) {
    return prisma.tracerStudy.create({
      data: { ...data, alumniId },
    });
  }

  async getStats() {
    const [total, byTahun, byStatus] = await Promise.all([
      prisma.alumni.count(),
      prisma.alumni.groupBy({
        by: ['tahunLulus'],
        _count: true,
        orderBy: { tahunLulus: 'desc' },
        take: 5,
      }),
      prisma.tracerStudy.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return { total, byTahun, byStatus };
  }
}