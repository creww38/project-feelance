import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { logger } from '../config/logger';

// Resources that should be logged
const AUDIT_RESOURCES = [
  'users', 'berita', 'galeri', 'pengumuman', 'agenda',
  'ppdb', 'absensi', 'jadwal', 'nilai', 'perpustakaan',
  'alumni', 'settings',
];

// Actions that should be logged
const AUDIT_ACTIONS: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

export const auditLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Store original end method
  const originalEnd = res.end;

  // Override end method
  res.end = function (this: Response, ...args: any[]) {
    // Only log successful requests
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logActivity(req, res).catch((error) => {
        logger.error('Failed to log activity:', error);
      });
    }

    // Call original end
    return originalEnd.apply(this, args);
  };

  next();
};

async function logActivity(req: Request, res: Response): Promise<void> {
  try {
    // Skip if no user authenticated
    if (!req.user) return;

    // Extract resource from URL
    const urlParts = req.originalUrl.split('/');
    const resource = urlParts[2]; // /api/{resource}/...

    // Check if resource should be audited
    if (!AUDIT_RESOURCES.some((r) => resource?.startsWith(r))) return;

    // Determine action
    const method = req.method.toUpperCase();
    const action = AUDIT_ACTIONS[method];

    if (!action) return;

    // Build description
    const resourceName = resource.split('?')[0];
    const resourceId = urlParts[3]?.split('?')[0];
    const description = `${action} ${resourceName}${resourceId ? ` (ID: ${resourceId})` : ''}`;

    // Create audit log
    await prisma.logAktivitas.create({
      data: {
        userId: req.user.id,
        aksi: `${action}_${resourceName.toUpperCase()}`,
        deskripsi: description,
        resource: resourceName,
        resourceId: resourceId || null,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        metadata: {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          body: method === 'GET' ? undefined : sanitizeBody(req.body),
        },
      },
    });
  } catch (error) {
    // Don't block the response if logging fails
    logger.error('Audit log error:', error);
  }
}

function sanitizeBody(body: any): any {
  if (!body) return undefined;

  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'refreshToken', 'token', 'secret'];
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Truncate large content
  const maxLength = 500;
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string' && sanitized[key].length > maxLength) {
      sanitized[key] = sanitized[key].substring(0, maxLength) + '... [TRUNCATED]';
    }
  }

  return sanitized;
}

export default auditLog;