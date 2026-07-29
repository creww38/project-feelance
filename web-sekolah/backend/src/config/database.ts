// src/config/database.ts
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  // Development: log all queries
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = (global as any).prisma;
}

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('📦 Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

export default prisma;