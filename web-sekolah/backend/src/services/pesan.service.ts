// src/services/pesan.service.ts
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../utils/pagination';

export class PesanService {
  async getConversations(userId: string) {
    // Get unique users that have conversations with current user
    const conversations = await prisma.pesan.findMany({
      where: {
        OR: [{ pengirimId: userId }, { penerimaId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        pengirim: {
          select: { id: true, namaLengkap: true, foto: true },
        },
        penerima: {
          select: { id: true, namaLengkap: true, foto: true },
        },
      },
    });

    // Group by conversation partner
    const conversationMap = new Map();

    for (const msg of conversations) {
      const partnerId =
        msg.pengirimId === userId ? msg.penerimaId : msg.pengirimId;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner: msg.pengirimId === userId ? msg.penerima : msg.pengirim,
          lastMessage: msg.konten,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }

      if (msg.penerimaId === userId && !msg.isRead) {
        conversationMap.get(partnerId).unreadCount++;
      }
    }

    return Array.from(conversationMap.values()).sort(
      (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
    );
  }

  async getMessages(userId: string, partnerId: string, options: PaginationOptions) {
    const page = options.page || 1;
    const limit = options.limit || 50;

    const [messages, total] = await Promise.all([
      prisma.pesan.findMany({
        where: {
          OR: [
            { pengirimId: userId, penerimaId: partnerId },
            { pengirimId: partnerId, penerimaId: userId },
          ],
        },
        include: {
          pengirim: {
            select: { id: true, namaLengkap: true, foto: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pesan.count({
        where: {
          OR: [
            { pengirimId: userId, penerimaId: partnerId },
            { pengirimId: partnerId, penerimaId: userId },
          ],
        },
      }),
    ]);

    // Mark messages as read
    await prisma.pesan.updateMany({
      where: {
        pengirimId: partnerId,
        penerimaId: userId,
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    return {
      items: messages.reverse(),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async sendMessage(pengirimId: string, data: { penerimaId: string; konten: string }) {
    // Validate recipient exists
    const penerima = await prisma.user.findUnique({
      where: { id: data.penerimaId },
    });

    if (!penerima) {
      throw new AppError('Penerima tidak ditemukan', 404);
    }

    return prisma.pesan.create({
      data: {
        pengirimId,
        penerimaId: data.penerimaId,
        konten: data.konten,
      },
      include: {
        pengirim: {
          select: { id: true, namaLengkap: true, foto: true },
        },
      },
    });
  }

  async markAsRead(pesanId: string, userId: string) {
    const pesan = await prisma.pesan.findUnique({ where: { id: pesanId } });

    if (!pesan) {
      throw new AppError('Pesan tidak ditemukan', 404);
    }

    if (pesan.penerimaId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    return prisma.pesan.update({
      where: { id: pesanId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.pesan.count({
      where: {
        penerimaId: userId,
        isRead: false,
      },
    });
  }
}