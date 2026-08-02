import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export class AgendaRepository {
  private defaultInclude = {
    author: {
      select: { id: true, namaLengkap: true },
    },
  };

  async findAll(options: PaginationOptions, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.agenda.findMany({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { tanggalMulai: 'asc' },
      }),
      prisma.agenda.count({ where }),
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

  async findById(id: string) {
    return prisma.agenda.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findByDate(date: Date) {
    return prisma.agenda.findMany({
      where: {
        tanggalMulai: { lte: endOfDay(date) },
        tanggalSelesai: { gte: startOfDay(date) },
      },
      include: this.defaultInclude,
      orderBy: { tanggalMulai: 'asc' },
    });
  }

  async findByMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return prisma.agenda.findMany({
      where: {
        OR: [
          {
            tanggalMulai: { gte: startDate, lte: endDate },
          },
          {
            tanggalSelesai: { gte: startDate, lte: endDate },
          },
          {
            tanggalMulai: { lte: startDate },
            tanggalSelesai: { gte: endDate },
          },
        ],
      },
      include: this.defaultInclude,
      orderBy: { tanggalMulai: 'asc' },
    });
  }

  async findUpcoming(limit: number = 5) {
    return prisma.agenda.findMany({
      where: {
        tanggalMulai: { gte: new Date() },
      },
      include: this.defaultInclude,
      take: limit,
      orderBy: { tanggalMulai: 'asc' },
    });
  }

  async create(data: any) {
    return prisma.agenda.create({
      data,
      include: this.defaultInclude,
    });
  }

  async update(id: string, data: any) {
    return prisma.agenda.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: string) {
    return prisma.agenda.delete({
      where: { id },
    });
  }
}