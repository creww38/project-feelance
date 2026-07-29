// src/socket/index.ts
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { logger } from '../config/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const setupSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'access-secret'
      ) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { userRoles: { include: { role: true } } },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.userRole = user.userRoles[0]?.role.nama;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join personal room
    socket.join(`user:${socket.userId}`);

    // Handle chat messages
    socket.on('message:send', async (data: { penerimaId: string; konten: string }) => {
      try {
        const pesan = await prisma.pesan.create({
          data: {
            pengirimId: socket.userId!,
            penerimaId: data.penerimaId,
            konten: data.konten,
          },
          include: {
            pengirim: {
              select: { id: true, namaLengkap: true, foto: true },
            },
          },
        });

        // Send to recipient
        io.to(`user:${data.penerimaId}`).emit('message:receive', pesan);

        // Send confirmation to sender
        socket.emit('message:sent', pesan);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('message:read', async (data: { pengirimId: string }) => {
      await prisma.pesan.updateMany({
        where: {
          pengirimId: data.pengirimId,
          penerimaId: socket.userId,
          isRead: false,
        },
        data: { isRead: true, readAt: new Date() },
      });

      io.to(`user:${data.pengirimId}`).emit('message:read-receipt', {
        penerimaId: socket.userId,
      });
    });

    // Handle typing status
    socket.on('typing:start', (data: { penerimaId: string }) => {
      io.to(`user:${data.penerimaId}`).emit('typing:start', {
        userId: socket.userId,
      });
    });

    socket.on('typing:stop', (data: { penerimaId: string }) => {
      io.to(`user:${data.penerimaId}`).emit('typing:stop', {
        userId: socket.userId,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });
};