import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class AbsensiController {
  record = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('absensi')
        .insert({
          siswa_id: req.body.siswaId,
          tanggal: new Date().toISOString(),
          status: req.body.status,
          keterangan: req.body.keterangan,
        })
        .select()
        .single();

      if (error) throw error;
      return ResponseHelper.created(res, { absensi: data }, 'Absensi tercatat');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  getBySiswa = async (req: Request, res: Response) => {
    try {
      const siswaId = (req as any).user?.siswa?.id || req.query.siswaId;
      const { data, error } = await supabase
        .from('absensi')
        .select('*')
        .eq('siswa_id', siswaId)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return ResponseHelper.success(res, { items: data || [] });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}