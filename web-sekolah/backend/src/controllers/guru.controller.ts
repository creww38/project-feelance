import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class GuruController {
  getAll = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('guru')
        .select('*, user:users(id, nama_lengkap, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ResponseHelper.success(res, { items: data || [] });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
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
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  getByUserId = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { data, error } = await supabase
        .from('guru')
        .select('*, user:users(id, nama_lengkap, email)')
        .eq('user_id', userId)
        .single();

      if (error || !data) return ResponseHelper.notFound(res, 'Data guru tidak ditemukan');
      return ResponseHelper.success(res, { guru: data });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}