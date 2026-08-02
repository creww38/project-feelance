import supabase from '../config/supabase';
import { AppError } from '../utils/AppError';

export class GuruService {
  async getAll(options: any) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('guru')
      .select('*, user:users(id, nama_lengkap, email, foto)', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      items: data || [],
      meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    };
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from('guru')
      .select('*, user:users(id, nama_lengkap, email, foto)')
      .eq('id', id)
      .single();

    if (error || !data) throw new AppError('Guru tidak ditemukan', 404);
    return data;
  }

  async getStats() {
    const { count, error } = await supabase
      .from('guru')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return { totalGuru: count || 0 };
  }
}