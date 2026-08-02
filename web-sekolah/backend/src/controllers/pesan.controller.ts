import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class PesanController {
  getConversations = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { data, error } = await supabase
        .from('pesan')
        .select('*, pengirim:users!pesan_pengirim_id_fkey(id, nama_lengkap, foto), penerima:users!pesan_penerima_id_fkey(id, nama_lengkap, foto)')
        .or(`pengirim_id.eq.${userId},penerima_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ResponseHelper.success(res, { items: data || [] });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  sendMessage = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { data, error } = await supabase
        .from('pesan')
        .insert({
          pengirim_id: userId,
          penerima_id: req.body.penerimaId,
          konten: req.body.konten,
        })
        .select()
        .single();

      if (error) throw error;
      return ResponseHelper.created(res, { pesan: data }, 'Pesan terkirim');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}