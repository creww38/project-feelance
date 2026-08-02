import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class NilaiRepository {
  private defaultInclude = {
    siswa: {
      include: {
        user: { select: { namaLengkap: true } },
        kelas: { select: { nama: true } },
      },
    },
    mataPelajaran: { select: { id: true, kode: true, nama: true } },
  };

  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.nilai.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.nilai.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    return prisma.nilai.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findBySiswa(siswaId: string) {
    return prisma.nilai.findMany({
      where: { siswaId },
      include: {
        mataPelajaran: { select: { nama: true, kode: true } },
      },
      orderBy: { semester: 'asc' },
    });
  }

  async findBySiswaMapel(siswaId: string, mataPelajaranId: string, semester: number) {
    return prisma.nilai.findFirst({
      where: { siswaId, mataPelajaranId, semester },
    });
  }

  async create(data: any) {
    // Calculate nilai akhir
    const nilaiAkhir = calculateNilaiAkhir(data.nilaiTugas, data.nilaiUTS, data.nilaiUAS);
    const { grade, predikat } = getGradeAndPredikat(nilaiAkhir);

    return prisma.nilai.create({
      data: { ...data, nilaiAkhir, grade, predikat },
      include: this.defaultInclude,
    });
  }

  async update(id: string, data: any) {
    const nilaiAkhir = calculateNilaiAkhir(data.nilaiTugas, data.nilaiUTS, data.nilaiUAS);
    const { grade, predikat } = getGradeAndPredikat(nilaiAkhir);

    return prisma.nilai.update({
      where: { id },
      data: { ...data, nilaiAkhir, grade, predikat },
      include: this.defaultInclude,
    });
  }

  async delete(id: string) {
    return prisma.nilai.delete({ where: { id } });
  }

  async getRekapKelas(kelasId: string, semester: number) {
    const siswa = await prisma.siswa.findMany({
      where: { kelasId },
      include: {
        user: { select: { namaLengkap: true } },
        nilai: {
          where: { semester },
          include: {
            mataPelajaran: { select: { nama: true } },
          },
        },
      },
    });

    return siswa.map((s) => ({
      siswaId: s.id,
      nama: s.user.namaLengkap,
      nis: s.nis,
      nilai: s.nilai,
      rataRata: s.nilai.length > 0
        ? s.nilai.reduce((sum, n) => sum + (n.nilaiAkhir || 0), 0) / s.nilai.length
        : 0,
    }));
  }
}

// Helper functions
function calculateNilaiAkhir(
  nilaiTugas?: number,
  nilaiUTS?: number,
  nilaiUAS?: number
): number | null {
  if (!nilaiTugas && !nilaiUTS && !nilaiUAS) return null;

  const tugas = nilaiTugas || 0;
  const uts = nilaiUTS || 0;
  const uas = nilaiUAS || 0;

  return Math.round((tugas * 0.3 + uts * 0.3 + uas * 0.4) * 100) / 100;
}

function getGradeAndPredikat(nilaiAkhir: number | null): {
  grade: string | null;
  predikat: string | null;
} {
  if (nilaiAkhir === null) return { grade: null, predikat: null };

  if (nilaiAkhir >= 90) return { grade: 'A', predikat: 'Sangat Baik' };
  if (nilaiAkhir >= 80) return { grade: 'B', predikat: 'Baik' };
  if (nilaiAkhir >= 70) return { grade: 'C', predikat: 'Cukup' };
  if (nilaiAkhir >= 60) return { grade: 'D', predikat: 'Kurang' };
  return { grade: 'E', predikat: 'Sangat Kurang' };
}