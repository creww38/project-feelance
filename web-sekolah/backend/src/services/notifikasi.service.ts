// src/services/notifikasi.service.ts
import { NotifikasiRepository } from '../repositories/notifikasi.repository';
import prisma from '../config/database';

const notifikasiRepository = new NotifikasiRepository();

export class NotifikasiService {
  async getAll(userId: string, options: any) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const where: any = { userId };

    if (options.status) where.status = options.status;

    return notifikasiRepository.findAll({ page, limit }, where);
  }

  async getUnreadCount(userId: string) {
    return notifikasiRepository.countUnread(userId);
  }

  async markAsRead(id: string, userId: string) {
    return notifikasiRepository.update(id, {
      status: 'READ',
      readAt: new Date(),
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notifikasi.updateMany({
      where: { userId, status: 'UNREAD' },
      data: { status: 'READ', readAt: new Date() },
    });
  }

  async delete(id: string, userId: string) {
    await notifikasiRepository.delete(id);
  }

  // Helper to create notification
  async create(data: {
    userId: string;
    judul: string;
    konten: string;
    tipe?: string;
    link?: string;
  }) {
    return prisma.notifikasi.create({ data });
  }
}