import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class PengumumanController {
  getAll = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('pengumuman')
        .select('*, author:users(id, nama_lengkap)')
        .eq('status', 'PUBLISHED')
        .order('is_pinned', { ascending: false })
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
        .from('pengumuman')
        .select('*, author:users(id, nama_lengkap)')
        .eq('id', req.params.id)
        .single();

      if (error || !data) return ResponseHelper.notFound(res, 'Pengumuman tidak ditemukan');

      return ResponseHelper.success(res, { pengumuman: data });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return ResponseHelper.unauthorized(res);

      const { data, error } = await supabase
        .from('pengumuman')
        .insert({
          judul: req.body.judul,
          konten: req.body.konten,
          is_pinned: req.body.isPinned || false,
          priority: req.body.priority || 0,
          status: req.body.status || 'PUBLISHED',
          author_id: userId,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return ResponseHelper.created(res, { pengumuman: data }, 'Pengumuman berhasil dibuat');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}