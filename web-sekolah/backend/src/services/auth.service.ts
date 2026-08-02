import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import supabase from '../config/supabase';

export class AuthService {
  async login(data: { email: string; password: string }) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*, user_roles(role_id, roles(id, nama))')
      .eq('email', data.email)
      .single();

    if (error || !user) {
      throw new AppError('Email atau password salah', 401);
    }

    if (!user.is_active) {
      throw new AppError('Akun dinonaktifkan', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Email atau password salah', 401);
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET || 'secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString(), refresh_token: refreshToken })
      .eq('id', user.id);

    const { password, refresh_token, user_roles, ...userData } = user;

    return {
      user: {
        ...userData,
        userRoles: user_roles?.map((ur: any) => ({ role: ur.roles })) || [],
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    if (!token) throw new AppError('Refresh token tidak ditemukan', 401);

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'secret') as any;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, refresh_token')
        .eq('id', decoded.id)
        .single();

      if (error || !user || user.refresh_token !== token) {
        throw new AppError('Token tidak valid', 401);
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_ACCESS_SECRET || 'secret',
        { expiresIn: '15m' }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      await supabase
        .from('users')
        .update({ refresh_token: newRefreshToken })
        .eq('id', user.id);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Token tidak valid', 401);
    }
  }

  async logout(userId: string) {
    await supabase.from('users').update({ refresh_token: null }).eq('id', userId);
  }

  async getCurrentUser(userId: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, nama_lengkap, foto, no_telp, alamat, is_active, last_login, created_at, user_roles(role_id, roles(id, nama))')
      .eq('id', userId)
      .single();

    if (error || !user) throw new AppError('User tidak ditemukan', 404);

    const { user_roles, ...userData } = user;

    return {
      ...userData,
      userRoles: user_roles?.map((ur: any) => ({ role: ur.roles })) || [],
    };
  }
}