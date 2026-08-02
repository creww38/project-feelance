import { Router } from 'express';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

// Public - optional auth (untuk like)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const supabase = (await import('../config/supabase')).default;
    const { data, error } = await supabase
      .from('berita')
      .select('*, kategori(id, nama, slug)')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({ status: 'success', data: { items: data } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Protected
router.post('/', authenticate, async (req, res) => {
  res.json({ status: 'success', message: 'Create berita - coming soon' });
});

export default router;