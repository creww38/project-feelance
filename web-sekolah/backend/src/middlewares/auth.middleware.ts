import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase';

/**
 * Required authentication middleware
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret') as any;

    const { data: user, error } = await supabase
      .from('users')
      .select('*, user_roles(role_id, roles(id, nama))')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ status: 'error', message: 'User tidak ditemukan' });
    }

    if (!user.is_active) {
      return res.status(401).json({ status: 'error', message: 'Akun dinonaktifkan' });
    }

    (req as any).user = {
      id: user.id,
      email: user.email,
      username: user.username,
      namaLengkap: user.nama_lengkap,
      nama_lengkap: user.nama_lengkap,
      foto: user.foto,
      isActive: user.is_active,
      is_active: user.is_active,
      lastLogin: user.last_login,
      userRoles: user.user_roles?.map((ur: any) => ({
        role: ur.roles,
      })),
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ status: 'error', message: 'Token tidak valid' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ status: 'error', message: 'Token kadaluarsa' });
    }
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't block if not
 */
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
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret') as any;

    const { data: user } = await supabase
      .from('users')
      .select('*, user_roles(role_id, roles(id, nama))')
      .eq('id', decoded.id)
      .single();

    if (user && user.is_active) {
      (req as any).user = {
        id: user.id,
        email: user.email,
        username: user.username,
        namaLengkap: user.nama_lengkap,
        nama_lengkap: user.nama_lengkap,
        foto: user.foto,
        isActive: user.is_active,
        is_active: user.is_active,
        lastLogin: user.last_login,
        userRoles: user.user_roles?.map((ur: any) => ({
          role: ur.roles,
        })),
      };
    }
  } catch (error) {
    // Continue without authentication
  }
  next();
};

/**
 * Role-based authorization
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Silakan login terlebih dahulu' });
    }

    const userRoles = user.userRoles?.map((ur: any) => ur.role?.nama) || [];

    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ status: 'error', message: 'Anda tidak memiliki izin' });
    }

    next();
  };
};