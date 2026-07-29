// src/services/nilai.service.ts
import { NilaiRepository } from '../repositories/nilai.repository';
import { AppError } from '../utils/AppError';
import prisma from '../config/database';

const nilaiRepository = new NilaiRepository();

export class NilaiService {
  async getBySiswa(siswaId: string, semester?: number) {
    return nilaiRepository.findBySiswa(siswaId, semester);
  }

  async getByKelas(kelasId: string, mataPelajaranId: string, semester?: number) {
    return nilaiRepository.findByKelas(kelasId, mataPelajaranId, semester);
  }

  async input(data: any, userId: string) {
    const nilaiAkhir = this.calculateNilaiAkhir(
      data.nilaiTugas,
      data.nilaiUTS,
      data.nilaiUAS
    );

    return nilaiRepository.create({
      ...data,
      nilaiAkhir,
      grade: this.getGrade(nilaiAkhir),
      predikat: this.getPredikat(nilaiAkhir),
    });
  }

  async inputBulk(nilaiData: any[]) {
    const results = [];
    for (const data of nilaiData) {
      const nilai = await this.input(data, '');
      results.push(nilai);
    }
    return results;
  }

  async update(id: string, data: any) {
    const nilaiAkhir = this.calculateNilaiAkhir(
      data.nilaiTugas,
      data.nilaiUTS,
      data.nilaiUAS
    );

    return nilaiRepository.update(id, {
      ...data,
      nilaiAkhir,
      grade: this.getGrade(nilaiAkhir),
      predikat: this.getPredikat(nilaiAkhir),
    });
  }

  async getRapor(siswaId: string, semester?: number) {
    const nilai = await this.getBySiswa(siswaId, semester);
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: { user: true, kelas: { include: { jurusan: true } } },
    });

    return {
      siswa,
      nilai,
      semester,
    };
  }

  async exportRaporPDF(siswaId: string, semester?: number) {
    // PDF generation placeholder
    return Buffer.from('Rapor PDF placeholder');
  }

  private calculateNilaiAkhir(tugas?: number, uts?: number, uas?: number): number {
    const tugasVal = tugas || 0;
    const utsVal = uts || 0;
    const uasVal = uas || 0;
    return Math.round((tugasVal * 0.3 + utsVal * 0.3 + uasVal * 0.4) * 100) / 100;
  }

  private getGrade(nilai: number): string {
    if (nilai >= 90) return 'A';
    if (nilai >= 80) return 'B';
    if (nilai >= 70) return 'C';
    if (nilai >= 60) return 'D';
    return 'E';
  }

  private getPredikat(nilai: number): string {
    if (nilai >= 90) return 'Sangat Baik';
    if (nilai >= 80) return 'Baik';
    if (nilai >= 70) return 'Cukup';
    if (nilai >= 60) return 'Kurang';
    return 'Sangat Kurang';
  }
}