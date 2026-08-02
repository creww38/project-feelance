import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class NotifikasiController {
  getByUser = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { data, error } = await supabase
        .from('notifikasi')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return ResponseHelper.success(res, { items: data || [] });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const { error } = await supabase
        .from('notifikasi')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', req.params.id);

      if (error) throw error;
      return ResponseHelper.success(res, null, 'Notifikasi ditandai sudah dibaca');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}