import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class PesanRepository {
  private defaultPengirimSelect = {
    id: true,
    namaLengkap: true,
    foto: true,
  };

  /**
   * Get conversations list for user
   * Returns list of users with last message
   */
  async getConversations(userId: string) {
    // Get all messages where user is either sender or receiver
    const messages = await prisma.pesan.findMany({
      where: {
        OR: [
          { pengirimId: userId },
          { penerimaId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        pengirim: {
          select: this.defaultPengirimSelect,
        },
        penerima: {
          select: this.defaultPengirimSelect,
        },
      },
    });

    // Group by conversation partner
    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      const partnerId = msg.pengirimId === userId ? msg.penerimaId : msg.pengirimId;
      const partner = msg.pengirimId === userId ? msg.penerima : msg.pengirim;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner: {
            id: partner.id,
            namaLengkap: partner.namaLengkap,
            foto: partner.foto,
          },
          lastMessage: msg.konten,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }

      // Count unread messages
      if (msg.penerimaId === userId && !msg.isRead) {
        conversationMap.get(partnerId).unreadCount++;
      }
    }

    return Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }

  /**
   * Get messages between two users
   */
  async getMessages(
    userId: string,
    partnerId: string,
    options: PaginationOptions
  ) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { pengirimId: userId, penerimaId: partnerId },
        { pengirimId: partnerId, penerimaId: userId },
      ],
    };

    const [items, total] = await Promise.all([
      prisma.pesan.findMany({
        where,
        include: {
          pengirim: {
            select: this.defaultPengirimSelect,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pesan.count({ where }),
    ]);

    return {
      items: items.reverse(), // Return in chronological order
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
   * Get single message by ID
   */
  async findById(id: string) {
    return prisma.pesan.findUnique({
      where: { id },
      include: {
        pengirim: {
          select: this.defaultPengirimSelect,
        },
        penerima: {
          select: this.defaultPengirimSelect,
        },
      },
    });
  }

  /**
   * Create new message
   */
  async create(data: {
    pengirimId: string;
    penerimaId: string;
    konten: string;
    lampiran?: string;
  }) {
    return prisma.pesan.create({
      data: {
        pengirimId: data.pengirimId,
        penerimaId: data.penerimaId,
        konten: data.konten,
        lampiran: data.lampiran,
      },
      include: {
        pengirim: {
          select: this.defaultPengirimSelect,
        },
      },
    });
  }

  /**
   * Mark message as read
   */
  async markAsRead(id: string) {
    return prisma.pesan.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all messages from a sender as read
   */
  async markAllAsRead(pengirimId: string, penerimaId: string) {
    return prisma.pesan.updateMany({
      where: {
        pengirimId,
        penerimaId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.pesan.count({
      where: {
        penerimaId: userId,
        isRead: false,
      },
    });
  }

  /**
   * Get unread count per sender
   */
  async getUnreadCountBySender(userId: string) {
    const result = await prisma.pesan.groupBy({
      by: ['pengirimId'],
      where: {
        penerimaId: userId,
        isRead: false,
      },
      _count: { id: true },
    });

    return result.map((r) => ({
      pengirimId: r.pengirimId,
      unreadCount: r._count.id,
    }));
  }

  /**
   * Delete message
   */
  async delete(id: string) {
    return prisma.pesan.delete({
      where: { id },
    });
  }

  /**
   * Delete conversation between two users
   */
  async deleteConversation(userId: string, partnerId: string) {
    return prisma.pesan.deleteMany({
      where: {
        OR: [
          { pengirimId: userId, penerimaId: partnerId },
          { pengirimId: partnerId, penerimaId: userId },
        ],
      },
    });
  }

  /**
   * Search messages
   */
  async search(userId: string, query: string) {
    return prisma.pesan.findMany({
      where: {
        OR: [
          { pengirimId: userId },
          { penerimaId: userId },
        ],
        konten: { contains: query, mode: 'insensitive' as any },
      },
      include: {
        pengirim: { select: this.defaultPengirimSelect },
        penerima: { select: this.defaultPengirimSelect },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Get recent messages for user (for notification preview)
   */
  async getRecentMessages(userId: string, limit: number = 5) {
    return prisma.pesan.findMany({
      where: {
        penerimaId: userId,
        isRead: false,
      },
      include: {
        pengirim: {
          select: this.defaultPengirimSelect,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get message statistics for user
   */
  async getStats(userId: string) {
    const [totalDikirim, totalDiterima, unread] = await Promise.all([
      prisma.pesan.count({ where: { pengirimId: userId } }),
      prisma.pesan.count({ where: { penerimaId: userId } }),
      prisma.pesan.count({ where: { penerimaId: userId, isRead: false } }),
    ]);

    return {
      totalDikirim,
      totalDiterima,
      unread,
    };
  }

  /**
   * Check if user has unread messages
   */
  async hasUnreadMessages(userId: string): Promise<boolean> {
    const count = await prisma.pesan.count({
      where: {
        penerimaId: userId,
        isRead: false,
      },
    });

    return count > 0;
  }
}

export default PesanRepository;