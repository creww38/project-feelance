import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase';
import { ResponseHelper } from '../utils/responseHelper';
import { AppError } from '../utils/AppError';

export class AuthController {
    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) return ResponseHelper.badRequest(res, 'Email dan password harus diisi');

            const { data: user, error } = await supabase
                .from('users')
                .select('*, user_roles(role_id, roles(id, nama))')
                .eq('email', email)
                .single();

            if (error || !user) return ResponseHelper.unauthorized(res, 'Email atau password salah');
            if (!user.is_active) return ResponseHelper.unauthorized(res, 'Akun dinonaktifkan');

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return ResponseHelper.unauthorized(res, 'Email atau password salah');

            const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_ACCESS_SECRET || 'secret', { expiresIn: '1h' });
            const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || 'secret', { expiresIn: '7d' });

            await supabase.from('users').update({ last_login: new Date().toISOString(), refresh_token: refreshToken }).eq('id', user.id);

            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

            const { password: _, refresh_token, user_roles, ...userData } = user;
            return ResponseHelper.success(res, {
                user: { ...userData, userRoles: user_roles?.map((ur: any) => ({ role: ur.roles })) || [] },
                accessToken,
            }, 'Login berhasil');
        } catch (err: any) {
            return ResponseHelper.error(res, err.message, 500);
        }
    };

    register = async (req: Request, res: Response) => {
        try {
            const { email, username, password, namaLengkap, role } = req.body;
            if (!email || !username || !password || !namaLengkap) {
                return ResponseHelper.badRequest(res, 'Semua field wajib diisi');
            }

            const { data: exist } = await supabase.from('users').select('id').or(`email.eq.${email},username.eq.${username}`).single();
            if (exist) return ResponseHelper.badRequest(res, 'Email atau username sudah digunakan');

            const hashed = await bcrypt.hash(password, 12);
            const { data: user, error } = await supabase.from('users').insert({
                email, username, password: hashed, nama_lengkap: namaLengkap, is_active: true
            }).select().single();

            if (error) throw error;

            if (role) {
                const { data: r } = await supabase.from('roles').select('id').eq('nama', role).single();
                if (r) await supabase.from('user_roles').insert({ user_id: user.id, role_id: r.id });
            }

            return ResponseHelper.created(res, { user: { id: user.id, email: user.email } }, 'Registrasi berhasil');
        } catch (err: any) {
            return ResponseHelper.error(res, err.message, 500);
        }
    };

    me = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, username, nama_lengkap, foto, no_telp, alamat, is_active, last_login, created_at, user_roles(role_id, roles(id, nama))')
                .eq('id', userId).single();

            if (error || !user) return ResponseHelper.notFound(res, 'User tidak ditemukan');

            const { user_roles, ...userData } = user;
            return ResponseHelper.success(res, {
                user: { ...userData, userRoles: user_roles?.map((ur: any) => ({ role: ur.roles })) || [] }
            });
        } catch (err: any) {
            return ResponseHelper.error(res, err.message, 500);
        }
    };

    refreshToken = async (req: Request, res: Response) => {
        try {
            const token = req.cookies?.refreshToken || req.body?.refreshToken;
            if (!token) return ResponseHelper.badRequest(res, 'Refresh token tidak ditemukan');

            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'secret') as any;
            const { data: user, error } = await supabase.from('users').select('id, email, refresh_token').eq('id', decoded.id).single();
            if (error || !user || user.refresh_token !== token) return ResponseHelper.unauthorized(res, 'Token tidak valid');

            const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_ACCESS_SECRET || 'secret', { expiresIn: '1h' });
            const newRefresh = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || 'secret', { expiresIn: '7d' });

            await supabase.from('users').update({ refresh_token: newRefresh }).eq('id', user.id);
            res.cookie('refreshToken', newRefresh, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

            return ResponseHelper.success(res, { accessToken });
        } catch (err: any) {
            return ResponseHelper.unauthorized(res, 'Token tidak valid atau kadaluarsa');
        }
    };

    logout = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (userId) await supabase.from('users').update({ refresh_token: null }).eq('id', userId);
            res.clearCookie('refreshToken');
            return ResponseHelper.success(res, null, 'Logout berhasil');
        } catch (err: any) {
            return ResponseHelper.error(res, err.message, 500);
        }
    };

    changePassword = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) return ResponseHelper.badRequest(res, 'Password lama dan baru harus diisi');
            if (newPassword.length < 8) return ResponseHelper.badRequest(res, 'Password minimal 8 karakter');

            const { data: user } = await supabase.from('users').select('password').eq('id', userId).single();
            if (!user) return ResponseHelper.notFound(res);

            const valid = await bcrypt.compare(oldPassword, user.password);
            if (!valid) return ResponseHelper.badRequest(res, 'Password lama salah');

            const hashed = await bcrypt.hash(newPassword, 12);
            await supabase.from('users').update({ password: hashed, refresh_token: null }).eq('id', userId);
            res.clearCookie('refreshToken');
            return ResponseHelper.success(res, null, 'Password berhasil diubah');
        } catch (err: any) {
            return ResponseHelper.error(res, err.message, 500);
        }
    };
}