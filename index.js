const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SECRET_KEY || ''
);

// ============================================
// MIDDLEWARE AUTH
// ============================================
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================================
// HEALTH
// ============================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// AUTH
// ============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET || 'secret', { expiresIn: '1h' });
    const { password: _, ...userData } = user;
    res.json({ status: 'success', data: { user: userData, accessToken: token } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const { data: user, error } = await supabase.from('users').select('id, email, username, nama_lengkap, foto, is_active').eq('id', req.userId).single();
  if (error) return res.status(404).json({ error: 'User not found' });
  res.json({ status: 'success', data: { user } });
});

// ============================================
// BERITA
// ============================================
app.get('/api/berita', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('berita')
    .select('*', { count: 'exact' })
    .eq('status', 'PUBLISHED')
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'success', data: { items: data, meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) } } });
});

app.get('/api/berita/:slug', async (req, res) => {
  const { data, error } = await supabase.from('berita').select('*').eq('slug', req.params.slug).single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  res.json({ status: 'success', data: { berita: data } });
});

app.post('/api/berita', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('berita').insert({
    judul: req.body.judul,
    slug: req.body.judul.toLowerCase().replace(/\s+/g, '-'),
    konten: req.body.konten,
    ringkasan: req.body.ringkasan,
    status: req.body.status || 'DRAFT',
    author_id: req.userId,
    kategori_id: req.body.kategoriId,
    published_at: req.body.status === 'PUBLISHED' ? new Date().toISOString() : null,
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ status: 'success', data: { berita: data } });
});

// ============================================
// PENGUMUMAN
// ============================================
app.get('/api/pengumuman', async (req, res) => {
  const { data, error } = await supabase.from('pengumuman').select('*').eq('status', 'PUBLISHED').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'success', data: { items: data } });
});

app.post('/api/pengumuman', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('pengumuman').insert({
    judul: req.body.judul,
    konten: req.body.konten,
    is_pinned: req.body.isPinned || false,
    priority: req.body.priority || 0,
    status: req.body.status || 'PUBLISHED',
    author_id: req.userId,
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ status: 'success', data: { pengumuman: data } });
});

// ============================================
// AGENDA
// ============================================
app.get('/api/agenda', async (req, res) => {
  const { data, error } = await supabase.from('agenda').select('*').order('tanggal_mulai', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'success', data: { items: data } });
});

// ============================================
// GALERI
// ============================================
app.get('/api/galeri', async (req, res) => {
  const { data, error } = await supabase.from('galeri').select('*').order('created_at', { ascending: false }).limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'success', data: { items: data } });
});

// ============================================
// PPDB
// ============================================
app.post('/api/ppdb', async (req, res) => {
  const no = 'PPDB' + Date.now().toString().slice(-6);
  const { data, error } = await supabase.from('ppdb').insert({
    no_pendaftaran: no,
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
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ status: 'success', data: { ppdb: data } });
});

app.get('/api/ppdb/check/:no', async (req, res) => {
  const { data, error } = await supabase.from('ppdb').select('*').eq('no_pendaftaran', req.params.no).single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  res.json({ status: 'success', data: { ppdb: data } });
});

// ============================================
// DASHBOARD
// ============================================
app.get('/api/dashboard/admin', authMiddleware, async (req, res) => {
  const [users, berita, pengumuman, ppdb] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('berita').select('*', { count: 'exact', head: true }),
    supabase.from('pengumuman').select('*', { count: 'exact', head: true }),
    supabase.from('ppdb').select('*', { count: 'exact', head: true }),
  ]);
  res.json({ status: 'success', data: {
    totalUsers: users.count || 0,
    totalBerita: berita.count || 0,
    totalPengumuman: pengumuman.count || 0,
    totalPPDB: ppdb.count || 0,
  }});
});

// ============================================
// USERS
// ============================================
app.get('/api/users', authMiddleware, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await supabase.from('users').select('id, email, username, nama_lengkap, foto, is_active, created_at', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'success', data: { items: data, meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) } } });
});

app.get('/api/users/profile', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('users').select('id, email, username, nama_lengkap, foto, is_active').eq('id', req.userId).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json({ status: 'success', data: { user: data } });
});

// ============================================
// GURU
// ============================================
app.get('/api/guru', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('guru').select('*, users(id, nama_lengkap, email)');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'success', data: { items: data } });
});

// ============================================
// SISWA
// ============================================
app.get('/api/siswa', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('siswa').select('*, users(id, nama_lengkap, email)');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'success', data: { items: data } });
});

// ============================================
// ABSENSI
// ============================================
app.post('/api/absensi', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('absensi').insert({
    siswa_id: req.body.siswaId,
    status: req.body.status,
    keterangan: req.body.keterangan,
    tanggal: new Date().toISOString(),
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ status: 'success', data: { absensi: data } });
});

app.get('/api/absensi/siswa', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('absensi').select('*').eq('siswa_id', req.query.siswaId).order('tanggal', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'success', data: { items: data } });
});

// ============================================
// NOTIFIKASI
// ============================================
app.get('/api/notifikasi', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('notifikasi').select('*').eq('user_id', req.userId).order('created_at', { ascending: false }).limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'success', data: { items: data } });
});

// ============================================
// SEARCH
// ============================================
app.get('/api/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Query required' });
  const [berita, users] = await Promise.all([
    supabase.from('berita').select('id, judul, slug').ilike('judul', `%${q}%`).limit(5),
    supabase.from('users').select('id, nama_lengkap, email').ilike('nama_lengkap', `%${q}%`).limit(5),
  ]);
  res.json({ status: 'success', data: { berita: berita.data || [], users: users.data || [] } });
});

// ============================================
// CATCH ALL
// ============================================
app.all('*', (req, res) => {
  res.json({ message: 'SISTech API v1.0', path: req.path, method: req.method });
});

module.exports = app;