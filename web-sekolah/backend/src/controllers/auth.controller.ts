import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseHelper } from '../utils/responseHelper';
import { AppError } from '../utils/AppError';

const authService = new AuthService();

export class AuthController {
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return ResponseHelper.badRequest(res, 'Email dan password harus diisi');
      }

      const result = await authService.login({ email, password });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ResponseHelper.success(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Login berhasil');
    } catch (error: any) {
      if (error instanceof AppError) {
        return ResponseHelper.error(res, error.message, error.statusCode);
      }
      return ResponseHelper.error(res, error.message || 'Login gagal', 500);
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'User tidak ditemukan');
      }
      
      const user = await authService.getCurrentUser(userId);
      return ResponseHelper.success(res, { user });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message, error.statusCode || 500);
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      if (!token) {
        return ResponseHelper.badRequest(res, 'Refresh token tidak ditemukan');
      }

      const result = await authService.refreshToken(token);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ResponseHelper.success(res, { accessToken: result.accessToken });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message, error.statusCode || 401);
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (userId) {
        await authService.logout(userId);
      }
      res.clearCookie('refreshToken');
      return ResponseHelper.success(res, null, 'Logout berhasil');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message, 500);
    }
  };
}