import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class BeritaController {
  getAll = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('berita')
        .select('*, kategori(id, nama, slug), author:users(id, nama_lengkap, foto)', { count: 'exact' })
        .eq('status', 'PUBLISHED')
        .order('published_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return ResponseHelper.paginated(res, {
        items: data || [],
        meta: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  getBySlug = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('berita')
        .select('*, kategori(id, nama, slug), author:users(id, nama_lengkap, foto)')
        .eq('slug', req.params.slug)
        .single();

      if (error || !data) {
        return ResponseHelper.notFound(res, 'Berita tidak ditemukan');
      }

      return ResponseHelper.success(res, { berita: data });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return ResponseHelper.unauthorized(res);

      const { data, error } = await supabase
        .from('berita')
        .insert({
          judul: req.body.judul,
          slug: req.body.judul.toLowerCase().replace(/\s+/g, '-'),
          konten: req.body.konten,
          ringkasan: req.body.ringkasan,
          gambar: req.body.gambar,
          status: req.body.status || 'DRAFT',
          author_id: userId,
          kategori_id: req.body.kategoriId,
          published_at: req.body.status === 'PUBLISHED' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      return ResponseHelper.created(res, { berita: data }, 'Berita berhasil dibuat');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const updateData: any = {};
      if (req.body.judul) updateData.judul = req.body.judul;
      if (req.body.konten) updateData.konten = req.body.konten;
      if (req.body.ringkasan) updateData.ringkasan = req.body.ringkasan;
      if (req.body.gambar) updateData.gambar = req.body.gambar;
      if (req.body.status) {
        updateData.status = req.body.status;
        if (req.body.status === 'PUBLISHED') updateData.published_at = new Date().toISOString();
      }
      if (req.body.kategoriId) updateData.kategori_id = req.body.kategoriId;

      const { data, error } = await supabase
        .from('berita')
        .update(updateData)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      return ResponseHelper.success(res, { berita: data }, 'Berita berhasil diupdate');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { error } = await supabase
        .from('berita')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      return ResponseHelper.success(res, null, 'Berita berhasil dihapus');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}