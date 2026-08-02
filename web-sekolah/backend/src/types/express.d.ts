import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        namaLengkap?: string;
        nama_lengkap?: string;
        foto?: string;
        isActive?: boolean;
        is_active?: boolean;
        lastLogin?: Date;
        last_login?: Date;
        userRoles?: Array<{
          role?: {
            id?: string;
            nama?: string;
            rolePermissions?: Array<{
              permission?: {
                resource?: string;
                action?: string;
              };
            }>;
          };
        }>;
      };
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export {};