// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[]) || [];
      return res.status(400).json({
        status: 'error',
        message: `${field.join(', ')} sudah digunakan`,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Data tidak ditemukan',
      });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validasi database gagal',
    });
  }

  // Multer Errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'error',
      message: 'Error upload file',
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token tidak valid',
    });
  }

  // Default Error
  return res.status(500).json({
    status: 'error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Terjadi kesalahan server'
        : err.message,
  });
};