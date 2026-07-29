// src/config/redis.ts
import { createClient } from 'redis';
import { logger } from './logger';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('🔴 Redis connected successfully');
});

export const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
};

export const cacheGet = async (key: string): Promise<string | null> => {
  return await redisClient.get(key);
};

export const cacheSet = async (
  key: string,
  value: string,
  expireInSeconds: number = 3600
): Promise<void> => {
  await redisClient.set(key, value, {
    EX: expireInSeconds,
  });
};

export const cacheDelete = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

export const cacheDeletePattern = async (pattern: string): Promise<void> => {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

export default redisClient;