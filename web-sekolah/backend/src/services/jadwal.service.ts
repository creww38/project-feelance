import { JadwalRepository } from '../repositories/jadwal.repository';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../utils/pagination';

const jadwalRepository = new JadwalRepository();

export class JadwalService {
  async getAll(options: PaginationOptions, filters: any) {
    const where: any = {};

    if (filters.kelasId) {
      where.kelasId = filters.kelasId;
    }

    if (filters.guruId) {
      where.guruId = filters.guruId;
    }

    if (filters.hari) {
      where.hari = filters.hari;
    }

    return jadwalRepository.findAll(options, where);
  }

  async getById(id: string) {
    const jadwal = await jadwalRepository.findById(id);
    if (!jadwal) {
      throw new AppError('Jadwal tidak ditemukan', 404);
    }
    return jadwal;
  }

  async getByKelas(kelasId: string) {
    return jadwalRepository.findByKelas(kelasId);
  }

  async getByGuru(guruId: string, hari?: string) {
    return jadwalRepository.findByGuru(guruId, hari);
  }

  async getByHari(kelasId: string, hari: string) {
    return jadwalRepository.findByHari(kelasId, hari);
  }

  async create(data: any) {
    // Check for schedule conflicts
    await this.checkConflict(data);
    return jadwalRepository.create(data);
  }

  async createMany(items: any[]) {
    for (const item of items) {
      await this.checkConflict(item);
    }
    return jadwalRepository.createMany(items);
  }

  async update(id: string, data: any) {
    const existing = await jadwalRepository.findById(id);
    if (!existing) {
      throw new AppError('Jadwal tidak ditemukan', 404);
    }

    return jadwalRepository.update(id, data);
  }

  async delete(id: string) {
    const existing = await jadwalRepository.findById(id);
    if (!existing) {
      throw new AppError('Jadwal tidak ditemukan', 404);
    }

    await jadwalRepository.delete(id);
    return { message: 'Jadwal berhasil dihapus' };
  }

  private async checkConflict(data: any) {
    const existing = await jadwalRepository.findByHari(data.kelasId, data.hari);

    const conflict = existing.find((j) => {
      return (
        j.jamMulai < data.jamSelesai &&
        j.jamSelesai > data.jamMulai
      );
    });

    if (conflict) {
      throw new AppError(
        `Jadwal bentrok dengan ${conflict.mataPelajaran.nama} (${conflict.jamMulai}-${conflict.jamSelesai})`,
        400
      );
    }
  }
}