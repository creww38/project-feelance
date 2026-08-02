import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class AgendaController {
  getAll = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('agenda')
        .select('*')
        .order('tanggal_mulai', { ascending: true });

      if (error) throw error;
      return ResponseHelper.success(res, { items: data || [] });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { data, error } = await supabase
        .from('agenda')
        .insert({
          judul: req.body.judul,
          deskripsi: req.body.deskripsi,
          lokasi: req.body.lokasi,
          tanggal_mulai: req.body.tanggalMulai,
          tanggal_selesai: req.body.tanggalSelesai,
          author_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return ResponseHelper.created(res, { agenda: data }, 'Agenda berhasil dibuat');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}