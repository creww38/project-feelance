import { AgendaRepository } from '../repositories/agenda.repository';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../utils/pagination';

const agendaRepository = new AgendaRepository();

export class AgendaService {
  async getAll(options: PaginationOptions, filters: any) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { judul: { contains: filters.search, mode: 'insensitive' } },
        { deskripsi: { contains: filters.search, mode: 'insensitive' } },
        { lokasi: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tanggal) {
      const date = new Date(filters.tanggal);
      where.tanggalMulai = { lte: date };
      where.tanggalSelesai = { gte: date };
    }

    if (filters.bulan) {
      const [year, month] = filters.bulan.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      where.OR = [
        { tanggalMulai: { gte: startDate, lte: endDate } },
        { tanggalSelesai: { gte: startDate, lte: endDate } },
      ];
    }

    return agendaRepository.findAll(options, where);
  }

  async getById(id: string) {
    const agenda = await agendaRepository.findById(id);
    if (!agenda) {
      throw new AppError('Agenda tidak ditemukan', 404);
    }
    return agenda;
  }

  async getByDate(date: string) {
    return agendaRepository.findByDate(new Date(date));
  }

  async getByMonth(year: number, month: number) {
    return agendaRepository.findByMonth(year, month);
  }

  async getUpcoming(limit: number = 5) {
    return agendaRepository.findUpcoming(limit);
  }

  async create(data: any, authorId: string) {
    return agendaRepository.create({
      ...data,
      authorId,
    });
  }

  async update(id: string, data: any) {
    const existing = await agendaRepository.findById(id);
    if (!existing) {
      throw new AppError('Agenda tidak ditemukan', 404);
    }

    return agendaRepository.update(id, data);
  }

  async delete(id: string) {
    const existing = await agendaRepository.findById(id);
    if (!existing) {
      throw new AppError('Agenda tidak ditemukan', 404);
    }

    await agendaRepository.delete(id);
    return { message: 'Agenda berhasil dihapus' };
  }
}