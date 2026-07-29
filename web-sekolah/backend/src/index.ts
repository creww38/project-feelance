// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './config/logger';
import { setupSocket } from './socket';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

setupSocket(io);

// Start Server
const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();
    logger.info('📦 Database connected');

    // Connect to Redis
    if (process.env.REDIS_URL) {
      await connectRedis();
      logger.info('🔴 Redis connected');
    }

    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  httpServer.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  httpServer.close(() => {
    logger.info('💥 Process terminated!');
  });
});

startServer();