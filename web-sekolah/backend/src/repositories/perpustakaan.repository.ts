import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class PerpustakaanRepository {
  // ============================================
  // BUKU METHODS
  // ============================================

  private defaultBukuInclude = {
    peminjaman: {
      where: {
        status: { in: ['DIPINJAM', 'TERLAMBAT'] as any },
      },
      include: {
        user: {
          select: { id: true, namaLengkap: true, foto: true },
        },
      },
    },
  };

  /**
   * Get all books with pagination
   */
  async findAllBuku(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.buku.findMany({
        where,
        include: {
          _count: { select: { peminjaman: true } },
        },
        skip,
        take: limit,
        orderBy: options.sortBy
          ? { [options.sortBy]: options.sortOrder || 'desc' }
          : { createdAt: 'desc' },
      }),
      prisma.buku.count({ where }),
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
   * Find book by ID
   */
  async findBukuById(id: string) {
    return prisma.buku.findUnique({
      where: { id },
      include: {
        ...this.defaultBukuInclude,
        _count: { select: { peminjaman: true } },
      },
    });
  }

  /**
   * Find book by kode
   */
  async findBukuByKode(kode: string) {
    return prisma.buku.findUnique({
      where: { kode },
      include: this.defaultBukuInclude,
    });
  }

  /**
   * Find book by ISBN
   */
  async findBukuByIsbn(isbn: string) {
    return prisma.buku.findFirst({
      where: { isbn },
      include: this.defaultBukuInclude,
    });
  }

  /**
   * Search books
   */
  async searchBuku(query: string, options?: PaginationOptions) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { judul: { contains: query, mode: 'insensitive' as any } },
        { pengarang: { contains: query, mode: 'insensitive' as any } },
        { penerbit: { contains: query, mode: 'insensitive' as any } },
        { kode: { contains: query, mode: 'insensitive' as any } },
        { isbn: { contains: query, mode: 'insensitive' as any } },
        { kategori: { contains: query, mode: 'insensitive' as any } },
      ],
    };

    const [items, total] = await Promise.all([
      prisma.buku.findMany({
        where,
        skip,
        take: limit,
        orderBy: { judul: 'asc' },
      }),
      prisma.buku.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get available books
   */
  async findBukuTersedia(options?: PaginationOptions) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where = { tersedia: { gt: 0 } };

    const [items, total] = await Promise.all([
      prisma.buku.findMany({
        where,
        skip,
        take: limit,
        orderBy: { judul: 'asc' },
      }),
      prisma.buku.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get books by category
   */
  async findBukuByKategori(kategori: string, options?: PaginationOptions) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where = { kategori };

    const [items, total] = await Promise.all([
      prisma.buku.findMany({
        where,
        skip,
        take: limit,
        orderBy: { judul: 'asc' },
      }),
      prisma.buku.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Create book
   */
  async createBuku(data: any) {
    return prisma.buku.create({
      data: {
        kode: data.kode,
        isbn: data.isbn,
        judul: data.judul,
        pengarang: data.pengarang,
        penerbit: data.penerbit,
        tahun: data.tahun,
        edisi: data.edisi,
        kategori: data.kategori,
        deskripsi: data.deskripsi,
        cover: data.cover,
        jumlah: data.jumlah || 1,
        tersedia: data.jumlah || 1,
        lokasi: data.lokasi,
        rak: data.rak,
      },
    });
  }

  /**
   * Update book
   */
  async updateBuku(id: string, data: any) {
    return prisma.buku.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete book
   */
  async deleteBuku(id: string) {
    return prisma.buku.delete({
      where: { id },
    });
  }

  /**
   * Get book categories
   */
  async getKategoriBuku() {
    const result = await prisma.buku.groupBy({
      by: ['kategori'],
      _count: { id: true },
      where: { kategori: { not: null } },
      orderBy: { _count: { id: 'desc' } },
    });

    return result.map((r) => ({
      kategori: r.kategori,
      jumlah: r._count.id,
    }));
  }

  /**
   * Get book statistics
   */
  async getBukuStats() {
    const [totalBuku, totalTersedia, totalDipinjam, perKategori] = await Promise.all([
      prisma.buku.aggregate({
        _sum: { jumlah: true },
      }),
      prisma.buku.aggregate({
        _sum: { tersedia: true },
      }),
      prisma.peminjaman.count({
        where: { status: { in: ['DIPINJAM', 'TERLAMBAT'] } },
      }),
      this.getKategoriBuku(),
    ]);

    return {
      totalBuku: totalBuku._sum.jumlah || 0,
      totalTersedia: totalTersedia._sum.tersedia || 0,
      totalDipinjam,
      perKategori,
    };
  }

  // ============================================
  // PEMINJAMAN METHODS
  // ============================================

  private defaultPeminjamanInclude = {
    buku: {
      select: {
        id: true,
        kode: true,
        judul: true,
        pengarang: true,
        cover: true,
      },
    },
    user: {
      select: {
        id: true,
        namaLengkap: true,
        foto: true,
        email: true,
      },
    },
  };

  /**
   * Get all loans with pagination
   */
  async findAllPeminjaman(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.peminjaman.findMany({
        where,
        include: this.defaultPeminjamanInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.peminjaman.count({ where }),
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
   * Find loan by ID
   */
  async findPeminjamanById(id: string) {
    return prisma.peminjaman.findUnique({
      where: { id },
      include: this.defaultPeminjamanInclude,
    });
  }

  /**
   * Find loan by kode pinjam
   */
  async findPeminjamanByKode(kodePinjam: string) {
    return prisma.peminjaman.findUnique({
      where: { kodePinjam },
      include: this.defaultPeminjamanInclude,
    });
  }

  /**
   * Find active loans by user
   */
  async findActiveByUser(userId: string) {
    return prisma.peminjaman.findMany({
      where: {
        userId,
        status: { in: ['DIPINJAM', 'TERLAMBAT'] },
      },
      include: this.defaultPeminjamanInclude,
      orderBy: { batasKembali: 'asc' },
    });
  }

  /**
   * Find active loans by book
   */
  async findActiveByBuku(bukuId: string) {
    return prisma.peminjaman.findFirst({
      where: {
        bukuId,
        status: { in: ['DIPINJAM', 'TERLAMBAT'] },
      },
      include: this.defaultPeminjamanInclude,
    });
  }

  /**
   * Find overdue loans
   */
  async findOverdue() {
    return prisma.peminjaman.findMany({
      where: {
        status: { in: ['DIPINJAM', 'TERLAMBAT'] },
        batasKembali: { lt: new Date() },
      },
      include: this.defaultPeminjamanInclude,
      orderBy: { batasKembali: 'asc' },
    });
  }

  /**
   * Count active loans by user
   */
  async countActiveByUser(userId: string): Promise<number> {
    return prisma.peminjaman.count({
      where: {
        userId,
        status: { in: ['DIPINJAM', 'TERLAMBAT'] },
      },
    });
  }

  /**
   * Create loan
   */
  async createPeminjaman(data: any) {
    return prisma.peminjaman.create({
      data: {
        bukuId: data.bukuId,
        userId: data.userId,
        kodePinjam: data.kodePinjam,
        batasKembali: data.batasKembali,
        status: 'DIPINJAM',
      },
      include: this.defaultPeminjamanInclude,
    });
  }

  /**
   * Return book
   */
  async returnBuku(id: string, data: { status: string; denda: number; catatan?: string }) {
    return prisma.peminjaman.update({
      where: { id },
      data: {
        tanggalKembali: new Date(),
        status: data.status as any,
        denda: data.denda,
        catatan: data.catatan,
      },
      include: this.defaultPeminjamanInclude,
    });
  }

  /**
   * Update overdue loans status
   */
  async updateOverdueStatus() {
    return prisma.peminjaman.updateMany({
      where: {
        status: 'DIPINJAM',
        batasKembali: { lt: new Date() },
      },
      data: {
        status: 'TERLAMBAT',
      },
    });
  }

  /**
   * Get loan statistics
   */
  async getPeminjamanStats() {
    const [total, dipinjam, dikembalikan, terlambat, totalDenda] = await Promise.all([
      prisma.peminjaman.count(),
      prisma.peminjaman.count({ where: { status: 'DIPINJAM' } }),
      prisma.peminjaman.count({ where: { status: 'DIKEMBALIKAN' } }),
      prisma.peminjaman.count({ where: { status: 'TERLAMBAT' } }),
      prisma.peminjaman.aggregate({
        _sum: { denda: true },
      }),
    ]);

    return {
      total,
      dipinjam,
      dikembalikan,
      terlambat,
      totalDenda: totalDenda._sum.denda || 0,
    };
  }

  /**
   * Get most borrowed books
   */
  async getMostBorrowed(limit: number = 10) {
    const result = await prisma.peminjaman.groupBy({
      by: ['bukuId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const bukuIds = result.map((r) => r.bukuId);
    const buku = await prisma.buku.findMany({
      where: { id: { in: bukuIds } },
      select: { id: true, judul: true, kode: true, cover: true },
    });

    return result.map((r) => ({
      ...buku.find((b) => b.id === r.bukuId),
      totalPinjam: r._count.id,
    }));
  }

  /**
   * Get top borrowers
   */
  async getTopBorrowers(limit: number = 10) {
    const result = await prisma.peminjaman.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const userIds = result.map((r) => r.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, namaLengkap: true, foto: true },
    });

    return result.map((r) => ({
      ...users.find((u) => u.id === r.userId),
      totalPinjam: r._count.id,
    }));
  }
}

export default PerpustakaanRepository;