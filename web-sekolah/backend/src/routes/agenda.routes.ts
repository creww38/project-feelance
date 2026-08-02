import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth.middleware';
import supabase from '../config/supabase';

const router = Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agenda')
      .select('*')
      .order('tanggal_mulai', { ascending: true });

    if (error) throw error;
    res.json({ status: 'success', data: { items: data || [] } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;