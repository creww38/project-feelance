import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class DashboardController {
  admin = async (req: Request, res: Response) => {
    try {
      const [usersCount, beritaCount, pengumumanCount, ppdbCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('berita').select('*', { count: 'exact', head: true }),
        supabase.from('pengumuman').select('*', { count: 'exact', head: true }),
        supabase.from('ppdb').select('*', { count: 'exact', head: true }),
      ]);

      return ResponseHelper.success(res, {
        totalUsers: usersCount.count || 0,
        totalBerita: beritaCount.count || 0,
        totalPengumuman: pengumumanCount.count || 0,
        totalPPDB: ppdbCount.count || 0,
      });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  guru = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      const { data: guru } = await supabase
        .from('guru')
        .select('id')
        .eq('user_id', userId)
        .single();

      return ResponseHelper.success(res, {
        message: 'Guru dashboard',
        guruId: guru?.id,
      });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  siswa = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      const { data: siswa } = await supabase
        .from('siswa')
        .select('id, nis')
        .eq('user_id', userId)
        .single();

      return ResponseHelper.success(res, {
        message: 'Siswa dashboard',
        siswaId: siswa?.id,
        nis: siswa?.nis,
      });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  kepsek = async (req: Request, res: Response) => {
    try {
      const [guruCount, siswaCount, ppdbCount] = await Promise.all([
        supabase.from('guru').select('*', { count: 'exact', head: true }),
        supabase.from('siswa').select('*', { count: 'exact', head: true }),
        supabase.from('ppdb').select('*', { count: 'exact', head: true }),
      ]);

      return ResponseHelper.success(res, {
        totalGuru: guruCount.count || 0,
        totalSiswa: siswaCount.count || 0,
        totalPPDB: ppdbCount.count || 0,
      });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  orangTua = async (req: Request, res: Response) => {
    try {
      return ResponseHelper.success(res, {
        message: 'Orang Tua dashboard',
      });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}