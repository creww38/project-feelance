import { NilaiRepository } from '../repositories/nilai.repository';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../utils/pagination';

const nilaiRepository = new NilaiRepository();

export class NilaiService {
  async getAll(options: PaginationOptions, filters: any) {
    const where: any = {};

    if (filters.siswaId) {
      where.siswaId = filters.siswaId;
    }

    if (filters.mataPelajaranId) {
      where.mataPelajaranId = filters.mataPelajaranId;
    }

    if (filters.semester) {
      where.semester = parseInt(filters.semester);
    }

    return nilaiRepository.findAll(options, where);
  }

  async getById(id: string) {
    const nilai = await nilaiRepository.findById(id);
    if (!nilai) {
      throw new AppError('Nilai tidak ditemukan', 404);
    }
    return nilai;
  }

  async getBySiswa(siswaId: string) {
    return nilaiRepository.findBySiswa(siswaId);
  }

  async create(data: any) {
    // Check if already exists
    const existing = await nilaiRepository.findBySiswaMapel(
      data.siswaId,
      data.mataPelajaranId,
      data.semester
    );

    if (existing) {
      throw new AppError('Nilai untuk mata pelajaran dan semester ini sudah ada', 400);
    }

    return nilaiRepository.create(data);
  }

  async update(id: string, data: any) {
    const existing = await nilaiRepository.findById(id);
    if (!existing) {
      throw new AppError('Nilai tidak ditemukan', 404);
    }

    return nilaiRepository.update(id, data);
  }

  async delete(id: string) {
    const existing = await nilaiRepository.findById(id);
    if (!existing) {
      throw new AppError('Nilai tidak ditemukan', 404);
    }

    await nilaiRepository.delete(id);
    return { message: 'Nilai berhasil dihapus' };
  }

  async getRekapKelas(kelasId: string, semester: number) {
    return nilaiRepository.getRekapKelas(kelasId, semester);
  }

  async importNilai(items: any[]) {
    const results = { success: 0, failed: 0, errors: [] as any[] };

    for (const item of items) {
      try {
        const existing = await nilaiRepository.findBySiswaMapel(
          item.siswaId,
          item.mataPelajaranId,
          item.semester
        );

        if (existing) {
          await nilaiRepository.update(existing.id, item);
        } else {
          await nilaiRepository.create(item);
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          siswaId: item.siswaId,
          error: error.message,
        });
      }
    }

    return results;
  }
}