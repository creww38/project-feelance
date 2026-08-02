import prisma from '../config/database';
import { PaginationOptions } from '../utils/pagination';

export class NotifikasiRepository {
  /**
   * Get notifications by user ID with pagination
   */
  async findByUser(userId: string, options: PaginationOptions, filters: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.tipe) {
      where.tipe = filters.tipe;
    }

    if (filters.isRead !== undefined) {
      where.status = filters.isRead === 'true' ? 'READ' : 'UNREAD';
    }

    const [items, total] = await Promise.all([
      prisma.notifikasi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notifikasi.count({ where }),
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

  /**
   * Get single notification by ID
   */
  async findById(id: string) {
    return prisma.notifikasi.findUnique({
      where: { id },
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notifikasi.count({
      where: {
        userId,
        status: 'UNREAD',
      },
    });
  }

  /**
   * Get unread notifications
   */
  async getUnread(userId: string, limit: number = 10) {
    return prisma.notifikasi.findMany({
      where: {
        userId,
        status: 'UNREAD',
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create notification
   */
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
        status: 'UNREAD',
      },
    });
  }

  /**
   * Create notification for multiple users
   */
  async createBulk(
    userIds: string[],
    data: {
      judul: string;
      konten: string;
      tipe?: string;
      link?: string;
    }
  ) {
    const notifications = userIds.map((userId) => ({
      userId,
      judul: data.judul,
      konten: data.konten,
      tipe: data.tipe || 'INFO',
      link: data.link,
      status: 'UNREAD' as any,
    }));

    return prisma.notifikasi.createMany({
      data: notifications,
    });
  }

  /**
   * Create notification for all users with specific role
   */
  async createByRole(
    roleName: string,
    data: {
      judul: string;
      konten: string;
      tipe?: string;
      link?: string;
    }
  ) {
    const users = await prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: { nama: roleName as any },
          },
        },
        isActive: true,
      },
      select: { id: true },
    });

    const notifications = users.map((user) => ({
      userId: user.id,
      judul: data.judul,
      konten: data.konten,
      tipe: data.tipe || 'INFO',
      link: data.link,
      status: 'UNREAD' as any,
    }));

    return prisma.notifikasi.createMany({
      data: notifications,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string) {
    return prisma.notifikasi.update({
      where: { id },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string) {
    return prisma.notifikasi.updateMany({
      where: {
        userId,
        status: 'UNREAD',
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  /**
   * Delete notification
   */
  async delete(id: string) {
    return prisma.notifikasi.delete({
      where: { id },
    });
  }

  /**
   * Delete old notifications
   */
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

  /**
   * Delete all notifications for user
   */
  async deleteAllByUser(userId: string) {
    return prisma.notifikasi.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get notification statistics for user
   */
  async getStats(userId: string) {
    const [total, unread, read, perTipe] = await Promise.all([
      prisma.notifikasi.count({ where: { userId } }),
      prisma.notifikasi.count({ where: { userId, status: 'UNREAD' } }),
      prisma.notifikasi.count({ where: { userId, status: 'READ' } }),
      prisma.notifikasi.groupBy({
        by: ['tipe'],
        where: { userId },
        _count: { id: true },
      }),
    ]);

    return {
      total,
      unread,
      read,
      perTipe: perTipe.map((t) => ({
        tipe: t.tipe || 'INFO',
        count: t._count.id,
      })),
    };
  }
}

export default NotifikasiRepository;