// src/middlewares/rbac.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Silakan login terlebih dahulu', 401);
    }

    const userRoles = req.user.userRoles.map((ur) => ur.role.nama);

    const hasRole = roles.some((role) => userRoles.includes(role as any));

    if (!hasRole) {
      throw new AppError(
        'Anda tidak memiliki izin untuk mengakses resource ini',
        403
      );
    }

    next();
  };
};

export const checkPermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Silakan login terlebih dahulu', 401);
    }

    // Admin has all permissions
    if (req.user.userRoles.some((ur) => ur.role.nama === 'ADMIN')) {
      return next();
    }

    const hasPermission = req.user.userRoles.some((userRole) =>
      userRole.role.rolePermissions.some(
        (rp) =>
          rp.permission.resource === resource &&
          rp.permission.action === action
      )
    );

    if (!hasPermission) {
      throw new AppError(
        `Anda tidak memiliki izin ${action} untuk ${resource}`,
        403
      );
    }

    next();
  };
};