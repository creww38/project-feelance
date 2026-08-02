import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import supabase from '../config/supabase';

export class PPDBController {
  // Public - Create pendaftaran
  create = async (req: Request, res: Response) => {
    try {
      const noPendaftaran = 'PPDB' + Date.now().toString().slice(-6);

      const { data, error } = await supabase
        .from('ppdb')
        .insert({
          no_pendaftaran: noPendaftaran,
          nama_lengkap: req.body.namaLengkap,
          nisn: req.body.nisn,
          jenis_kelamin: req.body.jenisKelamin,
          tempat_lahir: req.body.tempatLahir,
          tanggal_lahir: req.body.tanggalLahir,
          alamat: req.body.alamat,
          no_telp: req.body.noTelp,
          asal_sekolah: req.body.asalSekolah,
          nama_ortu: req.body.namaOrtu,
          no_telp_ortu: req.body.noTelpOrtu,
          jurusan_id: req.body.jurusanId,
          status: 'DRAFT',
        })
        .select()
        .single();

      if (error) throw error;

      return ResponseHelper.created(res, { ppdb: data }, 'Pendaftaran berhasil');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  // Public - Check status
  getByNoPendaftaran = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('ppdb')
        .select('*, jurusan:jurusan(id, nama)')
        .eq('no_pendaftaran', req.params.noPendaftaran)
        .single();

      if (error || !data) {
        return ResponseHelper.notFound(res, 'Data pendaftaran tidak ditemukan');
      }

      return ResponseHelper.success(res, { ppdb: data });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  // Admin - Get all
  getAll = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('ppdb')
        .select('*, jurusan:jurusan(id, nama)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return ResponseHelper.success(res, { items: data || [] });
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };

  // Admin - Verify
  verify = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      const { data, error } = await supabase
        .from('ppdb')
        .update({
          status: req.body.status,
          catatan: req.body.catatan,
          verified_by: userId,
          verified_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      return ResponseHelper.success(res, { ppdb: data }, 'Status berhasil diupdate');
    } catch (error: any) {
      return ResponseHelper.error(res, error.message);
    }
  };
}