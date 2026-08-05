import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { ResponseHelper } from '../utils/responseHelper';

export class GuruController {
    getAll = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, error, count } = await supabase
                .from('guru')
                .select('*, user:users(id, nama_lengkap, email, foto)', { count: 'exact' })
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
                .from('guru')
                .select('*, user:users(id, nama_lengkap, email, foto)')
                .eq('id', req.params.id)
                .single();

            if (error || !data) return ResponseHelper.notFound(res, 'Guru tidak ditemukan');
            return ResponseHelper.success(res, { guru: data });
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };

    getByUserId = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const { data, error } = await supabase
                .from('guru')
                .select('*, user:users(id, nama_lengkap, email, foto)')
                .eq('user_id', userId)
                .single();

            if (error || !data) return ResponseHelper.notFound(res, 'Data guru tidak ditemukan');
            return ResponseHelper.success(res, { guru: data });
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };

    getStats = async (req: Request, res: Response) => {
        try {
            const { count, error } = await supabase
                .from('guru')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;

            return ResponseHelper.success(res, {
                totalGuru: count || 0,
            });
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };
}