import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class PerpustakaanController {
  getBuku = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('buku')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return ResponseHelper.success(res, { items: data || [] });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  getBukuById = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('buku')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !data) return ResponseHelper.notFound(res, 'Buku tidak ditemukan');

      return ResponseHelper.success(res, { buku: data });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}