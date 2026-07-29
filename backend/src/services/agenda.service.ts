// src/services/agenda.service.ts
import { AgendaRepository } from '../repositories/agenda.repository';
import { AppError } from '../utils/AppError';

const agendaRepository = new AgendaRepository();

export class AgendaService {
  async getAll(options: any, filters: any) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { judul: { contains: filters.search, mode: 'insensitive' } },
        { deskripsi: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.bulan && filters.tahun) {
      const startDate = new Date(filters.tahun, filters.bulan - 1, 1);
      const endDate = new Date(filters.tahun, filters.bulan, 0);
      where.tanggalMulai = {
        gte: startDate,
        lte: endDate,
      };
    }

    return agendaRepository.findAll(options, where);
  }

  async getById(id: string) {
    const agenda = await agendaRepository.findById(id);
    if (!agenda) throw new AppError('Agenda tidak ditemukan', 404);
    return agenda;
  }

  async getUpcoming() {
    return agendaRepository.findUpcoming();
  }

  async create(data: any, authorId: string) {
    return agendaRepository.create({
      ...data,
      authorId,
      tanggalMulai: new Date(data.tanggalMulai),
      tanggalSelesai: new Date(data.tanggalSelesai),
    });
  }

  async update(id: string, data: any) {
    await agendaRepository.findById(id);
    
    const updateData: any = { ...data };
    if (data.tanggalMulai) updateData.tanggalMulai = new Date(data.tanggalMulai);
    if (data.tanggalSelesai) updateData.tanggalSelesai = new Date(data.tanggalSelesai);

    return agendaRepository.update(id, updateData);
  }

  async delete(id: string) {
    await agendaRepository.delete(id);
  }
}