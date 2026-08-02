import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class GaleriController {
  getAll = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('galeri')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return ResponseHelper.success(res, { items: data || [] });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('galeri')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !data) return ResponseHelper.notFound(res, 'Item tidak ditemukan');

      return ResponseHelper.success(res, { galeri: data });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || 'system';

      const { data, error } = await supabase
        .from('galeri')
        .insert({
          judul: req.body.judul,
          deskripsi: req.body.deskripsi,
          tipe: req.body.tipe || 'FOTO',
          url: req.body.url,
          thumbnail: req.body.thumbnail,
          uploaded_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      return ResponseHelper.created(res, { galeri: data }, 'Item berhasil ditambahkan');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}