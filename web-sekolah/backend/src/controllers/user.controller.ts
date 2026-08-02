import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class UserController {
  // Get all users
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
        meta: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  // Get user by ID
  getById = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, nama_lengkap, foto, no_telp, alamat, is_active, created_at, user_roles(role_id, roles(id, nama))')
        .eq('id', req.params.id)
        .single();

      if (error || !data) {
        return ResponseHelper.notFound(res, 'User tidak ditemukan');
      }

      return ResponseHelper.success(res, { user: data });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  // Get own profile
  getProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return ResponseHelper.unauthorized(res);

      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, nama_lengkap, foto, no_telp, alamat, is_active, created_at, user_roles(role_id, roles(id, nama))')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return ResponseHelper.notFound(res, 'User tidak ditemukan');
      }

      return ResponseHelper.success(res, { user: data });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  // Update own profile
  updateProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return ResponseHelper.unauthorized(res);

      const updateData: any = {};
      if (req.body.namaLengkap) updateData.nama_lengkap = req.body.namaLengkap;
      if (req.body.noTelp !== undefined) updateData.no_telp = req.body.noTelp;
      if (req.body.alamat !== undefined) updateData.alamat = req.body.alamat;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      return ResponseHelper.success(res, null, 'Profile berhasil diupdate');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}