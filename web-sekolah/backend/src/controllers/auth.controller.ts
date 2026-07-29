// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema, registerSchema, changePasswordSchema } from '../validations/auth.validation';

const authService = new AuthService();

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const data = registerSchema.parse(req.body);
    const user = await authService.register(data);

    res.status(201).json({
      status: 'success',
      data: { user },
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const result = await authService.refreshToken(token);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      data: { accessToken: result.accessToken },
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.user!.id);
    res.clearCookie('refreshToken');

    res.status(200).json({
      status: 'success',
      message: 'Berhasil logout',
    });
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getCurrentUser(req.user!.id);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const data = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.user!.id, data);

    res.status(200).json({
      status: 'success',
      message: 'Password berhasil diubah',
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.forgotPassword(email);

    res.status(200).json({
      status: 'success',
      message: 'Link reset password telah dikirim ke email',
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);

    res.status(200).json({
      status: 'success',
      message: 'Password berhasil direset',
    });
  });
}