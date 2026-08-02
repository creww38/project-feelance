import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class SearchController {
  globalSearch = async (req: Request, res: Response) => {
    try {
      const q = req.query.q as string;
      if (!q) return ResponseHelper.badRequest(res, 'Query pencarian harus diisi');

      const [berita, users] = await Promise.all([
        supabase.from('berita').select('id, judul, slug, ringkasan').ilike('judul', `%${q}%`).limit(5),
        supabase.from('users').select('id, nama_lengkap, email, foto').ilike('nama_lengkap', `%${q}%`).limit(5),
      ]);

      return ResponseHelper.success(res, {
        berita: berita.data || [],
        users: users.data || [],
      });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}