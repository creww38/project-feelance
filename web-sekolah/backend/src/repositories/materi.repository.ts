import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class MateriRepository {
  private defaultInclude = {
    mataPelajaran: { select: { id: true, nama: true, kode: true } },
    guru: {
      include: { user: { select: { namaLengkap: true } } },
    },
    kelas: { select: { id: true, nama: true } },
  };

  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.materi.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.materi.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    return prisma.materi.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findByMapel(mataPelajaranId: string) {
    return prisma.materi.findMany({
      where: { mataPelajaranId },
      include: this.defaultInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    return prisma.materi.create({ data, include: this.defaultInclude });
  }

  async update(id: string, data: any) {
    return prisma.materi.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: string) {
    return prisma.materi.delete({ where: { id } });
  }
}