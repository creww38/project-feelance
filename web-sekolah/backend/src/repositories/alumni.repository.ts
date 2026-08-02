import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class AlumniRepository {
  private defaultInclude = {
    siswa: {
      include: {
        user: {
          select: {
            id: true,
            namaLengkap: true,
            foto: true,
            email: true,
            noTelp: true,
          },
        },
        kelas: {
          include: {
            jurusan: {
              select: { id: true, kode: true, nama: true },
            },
          },
        },
      },
    },
    tracerStudy: {
      orderBy: { tahun: 'desc' },
    },
  };

  /**
   * Get all alumni with pagination
   */
  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.alumni.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: options.sortBy
          ? { [options.sortBy]: options.sortOrder || 'desc' }
          : { tahunLulus: 'desc' },
      }),
      prisma.alumni.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Find alumni by ID
   */
  async findById(id: string) {
    return prisma.alumni.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  /**
   * Find alumni by siswa ID
   */
  async findBySiswaId(siswaId: string) {
    return prisma.alumni.findUnique({
      where: { siswaId },
      include: this.defaultInclude,
    });
  }

  /**
   * Find alumni by tahun lulus
   */
  async findByTahunLulus(tahunLulus: number, options?: PaginationOptions) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const where = { tahunLulus };

    const [items, total] = await Promise.all([
      prisma.alumni.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { siswa: { user: { namaLengkap: 'asc' } } },
      }),
      prisma.alumni.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Find alumni by jurusan
   */
  async findByJurusan(jurusan: string, options?: PaginationOptions) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const where = {
      jurusan: { contains: jurusan, mode: 'insensitive' as any },
    };

    const [items, total] = await Promise.all([
      prisma.alumni.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { tahunLulus: 'desc' },
      }),
      prisma.alumni.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Search alumni
   */
  async search(query: string, options?: PaginationOptions) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { siswa: { user: { namaLengkap: { contains: query, mode: 'insensitive' as any } } } },
        { pekerjaan: { contains: query, mode: 'insensitive' as any } },
        { namaPerusahaan: { contains: query, mode: 'insensitive' as any } },
        { universitas: { contains: query, mode: 'insensitive' as any } },
        { jurusan: { contains: query, mode: 'insensitive' as any } },
      ],
    };

    const [items, total] = await Promise.all([
      prisma.alumni.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { tahunLulus: 'desc' },
      }),
      prisma.alumni.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Create alumni
   */
  async create(data: any) {
    return prisma.alumni.create({
      data: {
        siswaId: data.siswaId,
        tahunLulus: data.tahunLulus,
        jurusan: data.jurusan,
        pekerjaan: data.pekerjaan,
        namaPerusahaan: data.namaPerusahaan,
        universitas: data.universitas,
        jurusanKuliah: data.jurusanKuliah,
        kontak: data.kontak,
        email: data.email,
        alamat: data.alamat,
      },
      include: this.defaultInclude,
    });
  }

  /**
   * Update alumni
   */
  async update(id: string, data: any) {
    return prisma.alumni.update({
      where: { id },
      data: {
        pekerjaan: data.pekerjaan,
        namaPerusahaan: data.namaPerusahaan,
        universitas: data.universitas,
        jurusanKuliah: data.jurusanKuliah,
        kontak: data.kontak,
        email: data.email,
        alamat: data.alamat,
      },
      include: this.defaultInclude,
    });
  }

  /**
   * Delete alumni
   */
  async delete(id: string) {
    // Delete related tracer study first
    await prisma.tracerStudy.deleteMany({
      where: { alumniId: id },
    });

    return prisma.alumni.delete({
      where: { id },
    });
  }

  /**
   * Get alumni statistics
   */
  async getStats() {
    const [totalAlumni, perTahun, perJurusan, perPekerjaan, perUniversitas] = await Promise.all([
      prisma.alumni.count(),
      prisma.alumni.groupBy({
        by: ['tahunLulus'],
        _count: { id: true },
        orderBy: { tahunLulus: 'desc' },
        take: 10,
      }),
      prisma.alumni.groupBy({
        by: ['jurusan'],
        _count: { id: true },
        where: { jurusan: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.alumni.groupBy({
        by: ['pekerjaan'],
        _count: { id: true },
        where: { pekerjaan: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.alumni.groupBy({
        by: ['universitas'],
        _count: { id: true },
        where: { universitas: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalAlumni,
      perTahun,
      perJurusan,
      perPekerjaan,
      perUniversitas,
    };
  }

  /**
   * Bulk create alumni (for graduation processing)
   */
  async bulkCreate(data: any[]) {
    return prisma.alumni.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // ============================================
  // TRACER STUDY METHODS
  // ============================================

  /**
   * Get tracer study by alumni ID
   */
  async getTracerStudyByAlumni(alumniId: string) {
    return prisma.tracerStudy.findMany({
      where: { alumniId },
      orderBy: { tahun: 'desc' },
    });
  }

  /**
   * Create tracer study
   */
  async createTracerStudy(data: any) {
    return prisma.tracerStudy.create({
      data: {
        alumniId: data.alumniId,
        tahun: data.tahun || new Date().getFullYear(),
        status: data.status,
        detail: data.detail,
        gaji: data.gaji,
        relevansi: data.relevansi,
      },
    });
  }

  /**
   * Update tracer study
   */
  async updateTracerStudy(id: string, data: any) {
    return prisma.tracerStudy.update({
      where: { id },
      data,
    });
  }

  /**
   * Get tracer study statistics
   */
  async getTracerStudyStats() {
    const stats = await prisma.tracerStudy.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const perTahun = await prisma.tracerStudy.groupBy({
      by: ['tahun'],
      _count: { id: true },
      orderBy: { tahun: 'desc' },
      take: 5,
    });

    return { perStatus: stats, perTahun };
  }
}

export default AlumniRepository;