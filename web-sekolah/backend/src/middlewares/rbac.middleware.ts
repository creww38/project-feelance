import { Request, Response, NextFunction } from 'express';

/**
 * Role-based authorization
 * Usage: router.get('/path', authenticate, authorize('ADMIN', 'GURU'), handler)
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
      return res.status(403).json({ status: 'error', message: 'Anda tidak memiliki izin untuk mengakses resource ini' });
    }

    next();
  };
};

/**
 * Permission-based authorization
 * Usage: router.get('/path', authenticate, checkPermission('berita', 'CREATE'), handler)
 */
export const checkPermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Silakan login terlebih dahulu' });
    }

    // Admin has all permissions
    const userRoles = user.userRoles?.map((ur: any) => ur.role?.nama) || [];
    if (userRoles.includes('ADMIN')) {
      return next();
    }

    // Check specific permission
    const hasPermission = user.userRoles?.some((userRole: any) =>
      userRole.role?.rolePermissions?.some(
        (rp: any) =>
          rp.permission?.resource === resource && rp.permission?.action === action
      )
    );

    if (!hasPermission) {
      return res.status(403).json({
        status: 'error',
        message: `Anda tidak memiliki izin ${action} untuk ${resource}`,
      });
    }

    next();
  };
};