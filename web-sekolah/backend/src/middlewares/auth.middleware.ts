// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError } from '../utils/AppError';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token tidak ditemukan', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'access-secret'
    ) as any;

    // Get user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        guru: true,
        siswa: true,
        orangTua: true,
      },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan', 401);
    }

    if (!user.isActive) {
      throw new AppError('Akun dinonaktifkan', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Token tidak valid', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token kadaluarsa', 401));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'access-secret'
    ) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: true,
              },
            },
          },
        },
      },
    });

    if (user?.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Continue without auth
  }
  next();
};