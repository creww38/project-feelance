// src/services/pesan.service.ts
import { PesanRepository } from '../repositories/pesan.repository';
import { AppError } from '../utils/AppError';
import prisma from '../config/database';

const pesanRepository = new PesanRepository();

export class PesanService {
  async getConversations(userId: string) {
    const messages = await prisma.pesan.findMany({
      where: {
        OR: [{ pengirimId: userId }, { penerimaId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        pengirim: { select: { id: true, namaLengkap: true, foto: true } },
        penerima: { select: { id: true, namaLengkap: true, foto: true } },
      },
    });

    // Group by conversation
    const conversations = new Map();
    for (const msg of messages) {
      const otherUser = msg.pengirimId === userId ? msg.penerima : msg.pengirim;
      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }
    }

    // Get unread counts
    const unreadCounts = await prisma.pesan.groupBy({
      by: ['pengirimId'],
      where: {
        penerimaId: userId,
        isRead: false,
      },
      _count: true,
    });

    for (const count of unreadCounts) {
      if (conversations.has(count.pengirimId)) {
        conversations.get(count.pengirimId).unreadCount = count._count;
      }
    }

    return Array.from(conversations.values());
  }

  async getMessages(userId: string, otherUserId: string, options: any) {
    const page = options.page || 1;
    const limit = options.limit || 50;

    const [messages, total] = await Promise.all([
      prisma.pesan.findMany({
        where: {
          OR: [
            { pengirimId: userId, penerimaId: otherUserId },
            { pengirimId: otherUserId, penerimaId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          pengirim: { select: { id: true, namaLengkap: true, foto: true } },
        },
      }),
      prisma.pesan.count({
        where: {
          OR: [
            { pengirimId: userId, penerimaId: otherUserId },
            { pengirimId: otherUserId, penerimaId: userId },
          ],
        },
      }),
    ]);

    return { items: messages.reverse(), meta: { total, page, limit } };
  }

  async send(pengirimId: string, penerimaId: string, konten: string, file?: Express.Multer.File) {
    return pesanRepository.create({
      pengirimId,
      penerimaId,
      konten,
      lampiran: file?.path ? `/uploads/documents/${file.filename}` : null,
    });
  }

  async markAsRead(userId: string, senderId: string) {
    await prisma.pesan.updateMany({
      where: {
        pengirimId: senderId,
        penerimaId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async delete(messageId: string, userId: string) {
    const pesan = await pesanRepository.findById(messageId);
    if (!pesan) throw new AppError('Pesan tidak ditemukan', 404);
    if (pesan.pengirimId !== userId) throw new AppError('Tidak diizinkan', 403);
    await pesanRepository.delete(messageId);
  }

  async getUnreadCount(userId: string) {
    return prisma.pesan.count({
      where: { penerimaId: userId, isRead: false },
    });
  }
}