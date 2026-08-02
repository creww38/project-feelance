// src/repositories/ppdb.repository.ts
import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class PPDBRepository {
  private defaultInclude = {
    jurusan: {
      select: { id: true, kode: true, nama: true },
    },
    tahunAjaran: {
      select: { id: true, nama: true },
    },
    berkas: true,
    verifier: {
      select: { id: true, namaLengkap: true },
    },
  };

  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.pPDB.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pPDB.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.pPDB.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findByNoPendaftaran(noPendaftaran: string) {
    return prisma.pPDB.findUnique({
      where: { noPendaftaran },
      include: this.defaultInclude,
    });
  }

  async create(data: any) {
    return prisma.pPDB.create({
      data,
      include: this.defaultInclude,
    });
  }

  async update(id: string, data: any) {
    return prisma.pPDB.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: string) {
    return prisma.pPDB.delete({ where: { id } });
  }
}