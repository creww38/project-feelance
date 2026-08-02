// src/services/notifikasi.service.ts
import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class NotifikasiService {
  async getByUser(userId: string, options: PaginationOptions) {
    const page = options.page || 1;
    const limit = options.limit || 20;

    const [items, total] = await Promise.all([
      prisma.notifikasi.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notifikasi.count({ where: { userId } }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUnreadCount(userId: string) {
    return prisma.notifikasi.count({
      where: {
        userId,
        status: 'UNREAD',
      },
    });
  }

  async markAsRead(notifikasiId: string, userId: string) {
    const notifikasi = await prisma.notifikasi.findUnique({
      where: { id: notifikasiId },
    });

    if (!notifikasi) {
      throw new Error('Notifikasi tidak ditemukan');
    }

    if (notifikasi.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return prisma.notifikasi.update({
      where: { id: notifikasiId },
      data: { status: 'READ', readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notifikasi.updateMany({
      where: { userId, status: 'UNREAD' },
      data: { status: 'READ', readAt: new Date() },
    });
  }

  async create(data: {
    userId: string;
    judul: string;
    konten: string;
    tipe?: string;
    link?: string;
  }) {
    return prisma.notifikasi.create({
      data: {
        userId: data.userId,
        judul: data.judul,
        konten: data.konten,
        tipe: data.tipe || 'INFO',
        link: data.link,
      },
    });
  }

  async deleteOld(days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return prisma.notifikasi.deleteMany({
      where: {
        createdAt: { lt: date },
        status: 'READ',
      },
    });
  }
}