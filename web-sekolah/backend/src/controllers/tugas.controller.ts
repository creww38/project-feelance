import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class TugasController {
  getAll = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('tugas')
        .select('*, mata_pelajaran:mata_pelajaran(id, nama)')
        .order('created_at', { ascending: false });

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
        .from('tugas')
        .insert({
          judul: req.body.judul,
          deskripsi: req.body.deskripsi,
          deadline: req.body.deadline,
          mata_pelajaran_id: req.body.mataPelajaranId,
          guru_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return ResponseHelper.created(res, { tugas: data }, 'Tugas berhasil dibuat');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}