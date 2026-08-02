import rateLimit from 'express-rate-limit';
import { ResponseHelper } from '../utils/responseHelper';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Terlalu banyak permintaan, silakan coba lagi nanti',
  },
});

// Auth rate limiter (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Terlalu banyak percobaan, silakan coba lagi dalam 15 menit',
  },
  skipSuccessfulRequests: true,
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Batas upload tercapai, silakan coba lagi nanti',
  },
});

// Search rate limiter
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Terlalu banyak pencarian, silakan tunggu sebentar',
  },
});

// Custom rate limiter factory
export const createRateLimiter = (
  windowMs: number,
  max: number,
  message: string = 'Terlalu banyak permintaan'
) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      ResponseHelper.tooManyRequests(res, message);
    },
  });
};