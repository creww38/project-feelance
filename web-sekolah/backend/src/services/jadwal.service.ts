// src/services/jadwal.service.ts
import { JadwalRepository } from '../repositories/jadwal.repository';
import { AppError } from '../utils/AppError';
import prisma from '../config/database';

const jadwalRepository = new JadwalRepository();

export class JadwalService {
  async getByKelas(kelasId: string) {
    return jadwalRepository.findByKelas(kelasId);
  }

  async getByGuru(guruId: string) {
    return jadwalRepository.findByGuru(guruId);
  }

  async getBySiswa(siswaId: string) {
    const siswa = await prisma.siswa.findUnique({ where: { id: siswaId } });
    if (!siswa) throw new AppError('Siswa tidak ditemukan', 404);
    
    return jadwalRepository.findByKelas(siswa.kelasId);
  }

  async create(data: any) {
    return jadwalRepository.create(data);
  }

  async createBulk(jadwalData: any[]) {
    const results = [];
    for (const data of jadwalData) {
      const jadwal = await jadwalRepository.create(data);
      results.push(jadwal);
    }
    return results;
  }

  async update(id: string, data: any) {
    await jadwalRepository.findById(id);
    return jadwalRepository.update(id, data);
  }

  async delete(id: string) {
    await jadwalRepository.delete(id);
  }
}