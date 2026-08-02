// src/config/socket.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from './database';
import { logger } from './logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userData?: any;
}

export class SocketConfig {
  private io: Server;
  private connectedUsers: Map<string, Set<string>>;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.connectedUsers = new Map();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Token tidak ditemukan'));
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_ACCESS_SECRET || 'secret'
        ) as any;

        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            namaLengkap: true,
            email: true,
            foto: true,
            userRoles: {
              select: {
                role: { select: { nama: true } },
              },
            },
          },
        });

        if (!user) {
          return next(new Error('User tidak ditemukan'));
        }

        socket.userId = user.id;
        socket.userData = user;
        next();
      } catch (error) {
        next(new Error('Token tidak valid'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`User connected: ${socket.userId} - ${socket.userData?.namaLengkap}`);

      // Track connected users
      if (!this.connectedUsers.has(socket.userId!)) {
        this.connectedUsers.set(socket.userId!, new Set());
      }
      this.connectedUsers.get(socket.userId!)!.add(socket.id);

      // Join personal room
      socket.join(`user:${socket.userId}`);

      // Join role-based rooms
      socket.userData?.userRoles.forEach((ur: any) => {
        socket.join(`role:${ur.role.nama}`);
      });

      // Broadcast online status
      this.io.emit('user:online', {
        userId: socket.userId,
        namaLengkap: socket.userData?.namaLengkap,
      });

      // Handle private chat
      socket.on('chat:send', async (data: { to: string; message: string }) => {
        try {
          const pesan = await prisma.pesan.create({
            data: {
              pengirimId: socket.userId!,
              penerimaId: data.to,
              konten: data.message,
            },
            include: {
              pengirim: {
                select: {
                  id: true,
                  namaLengkap: true,
                  foto: true,
                },
              },
            },
          });

          // Send to recipient
          this.io.to(`user:${data.to}`).emit('chat:receive', pesan);

          // Send notification
          await this.createNotification({
            userId: data.to,
            judul: 'Pesan Baru',
            konten: `${socket.userData?.namaLengkap} mengirim pesan`,
            tipe: 'INFO',
            link: `/messages`,
          });

          // Acknowledge sender
          socket.emit('chat:sent', pesan);
        } catch (error) {
          socket.emit('chat:error', { message: 'Gagal mengirim pesan' });
        }
      });

      // Handle typing indicator
      socket.on('chat:typing', (data: { to: string; isTyping: boolean }) => {
        this.io.to(`user:${data.to}`).emit('chat:typing', {
          from: socket.userId,
          namaLengkap: socket.userData?.namaLengkap,
          isTyping: data.isTyping,
        });
      });

      // Handle mark as read
      socket.on('chat:read', async (data: { from: string }) => {
        await prisma.pesan.updateMany({
          where: {
            pengirimId: data.from,
            penerimaId: socket.userId,
            isRead: false,
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

        this.io.to(`user:${data.from}`).emit('chat:read-receipt', {
          readBy: socket.userId,
        });
      });

      // Handle join notification room
      socket.on('notification:subscribe', () => {
        socket.join(`notifications:${socket.userId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.userId}`);
        
        const userSockets = this.connectedUsers.get(socket.userId!);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.connectedUsers.delete(socket.userId!);
            this.io.emit('user:offline', {
              userId: socket.userId,
              namaLengkap: socket.userData?.namaLengkap,
            });
          }
        }
      });
    });
  }

  private async createNotification(data: {
    userId: string;
    judul: string;
    konten: string;
    tipe?: string;
    link?: string;
  }): Promise<void> {
    try {
      const notification = await prisma.notifikasi.create({
        data: {
          userId: data.userId,
          judul: data.judul,
          konten: data.konten,
          tipe: data.tipe || 'INFO',
          link: data.link,
        },
      });

      this.io.to(`notifications:${data.userId}`).emit('notification:new', notification);
      this.io.to(`user:${data.userId}`).emit('notification:new', notification);
    } catch (error) {
      logger.error('Failed to create notification:', error);
    }
  }

  getIO(): Server {
    return this.io;
  }

  broadcastToRole(role: string, event: string, data: any): void {
    this.io.to(`role:${role}`).emit(event, data);
  }

  sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId) && 
           (this.connectedUsers.get(userId)?.size || 0) > 0;
  }

  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}