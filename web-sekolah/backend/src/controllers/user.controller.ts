import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import supabase from '../config/supabase';
import { ResponseHelper } from '../utils/responseHelper';

export class UserController {
    getAll = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, error, count } = await supabase
                .from('users')
                .select('id, email, username, nama_lengkap, foto, is_active, created_at, user_roles(role_id, roles(id, nama))', { count: 'exact' })
                .range(from, to)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return ResponseHelper.paginated(res, {
                items: data || [],
                meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
            });
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };

    getById = async (req: Request, res: Response) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, email, username, nama_lengkap, foto, no_telp, alamat, is_active, created_at, user_roles(role_id, roles(id, nama))')
                .eq('id', req.params.id).single();
            if (error || !data) return ResponseHelper.notFound(res);
            return ResponseHelper.success(res, { user: data });
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };

    getProfile = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const { data, error } = await supabase
                .from('users')
                .select('id, email, username, nama_lengkap, foto, no_telp, alamat, is_active, created_at, user_roles(role_id, roles(id, nama))')
                .eq('id', userId).single();
            if (error || !data) return ResponseHelper.notFound(res);
            return ResponseHelper.success(res, { user: data });
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };

    updateProfile = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const update: any = {};
            if (req.body.namaLengkap) update.nama_lengkap = req.body.namaLengkap;
            if (req.body.noTelp !== undefined) update.no_telp = req.body.noTelp;
            if (req.body.alamat !== undefined) update.alamat = req.body.alamat;
            if (req.body.foto !== undefined) update.foto = req.body.foto;

            const { error } = await supabase.from('users').update(update).eq('id', userId);
            if (error) throw error;
            return ResponseHelper.success(res, null, 'Profile berhasil diupdate');
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };

    create = async (req: Request, res: Response) => {
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

            return ResponseHelper.created(res, { user: { id: user.id, email: user.email } }, 'User berhasil dibuat');
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const update: any = {};
            if (req.body.namaLengkap) update.nama_lengkap = req.body.namaLengkap;
            if (req.body.email) update.email = req.body.email;
            if (req.body.username) update.username = req.body.username;
            if (req.body.isActive !== undefined) update.is_active = req.body.isActive;
            if (req.body.noTelp !== undefined) update.no_telp = req.body.noTelp;
            if (req.body.alamat !== undefined) update.alamat = req.body.alamat;

            const { error } = await supabase.from('users').update(update).eq('id', req.params.id);
            if (error) throw error;
            return ResponseHelper.success(res, null, 'User berhasil diupdate');
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            await supabase.from('users').update({ is_active: false }).eq('id', req.params.id);
            return ResponseHelper.success(res, null, 'User berhasil dinonaktifkan');
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };

    getStats = async (req: Request, res: Response) => {
        try {
            const [total, active, inactive] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', false),
            ]);
            return ResponseHelper.success(res, {
                total: total.count || 0,
                active: active.count || 0,
                inactive: inactive.count || 0,
            });
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };
}