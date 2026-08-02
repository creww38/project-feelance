import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class MateriController {
  getAll = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('materi')
        .select('*, mata_pelajaran:id, nama')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ResponseHelper.success(res, { items: data || [] });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.guru?.id || (req as any).user?.id;
      const { data, error } = await supabase
        .from('materi')
        .insert({
          judul: req.body.judul,
          deskripsi: req.body.deskripsi,
          konten: req.body.konten,
          file_url: req.body.fileUrl,
          mata_pelajaran_id: req.body.mataPelajaranId,
          guru_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return ResponseHelper.created(res, { materi: data }, 'Materi berhasil dibuat');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}