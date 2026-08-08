const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

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
    return res.status(401).json({ status: 'error', message: 'Token required' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};

// ============================================
// DOCS
// ============================================
app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

// ============================================
// HEALTH
// ============================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// ROOT
// ============================================
app.get('/', (req, res) => {
  res.json({ name: 'SISTech API', version: '1.0.0', docs: '/docs', health: '/health' });
});

// ============================================
// AUTH
// ============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: 'error', message: 'Email and password required' });

    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !user) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    if (!user.is_active) return res.status(401).json({ status: 'error', message: 'Account disabled' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_ACCESS_SECRET || 'secret', { expiresIn: '1h' });
    const { password: _, ...userData } = user;
    res.json({ status: 'success', message: 'Login berhasil', data: { user: userData, accessToken: token } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const { data: user, error } = await supabase.from('users').select('id, email, username, nama_lengkap, foto, no_telp, is_active, created_at').eq('id', req.userId).single();
  if (error || !user) return res.status(404).json({ status: 'error', message: 'User not found' });
  res.json({ status: 'success', data: { user } });
});

// ============================================
// BERITA
// ============================================
app.get('/api/berita', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('berita')
      .select('*', { count: 'exact' })
      .eq('status', 'PUBLISHED')
      .range(from, to)
      .order('published_at', { ascending: false });

    if (error) throw error;
    res.json({
      status: 'success',
      data: {
        items: data || [],
        meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) }
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/berita/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase.from('berita').select('*').eq('slug', req.params.slug).single();
    if (error || !data) return res.status(404).json({ status: 'error', message: 'Berita tidak ditemukan' });
    res.json({ status: 'success', data: { berita: data } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/berita', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('berita').insert({
      judul: req.body.judul,
      slug: req.body.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      konten: req.body.konten,
      ringkasan: req.body.ringkasan,
      gambar: req.body.gambar,
      status: req.body.status || 'DRAFT',
      author_id: req.userId,
      kategori_id: req.body.kategoriId,
      published_at: req.body.status === 'PUBLISHED' ? new Date().toISOString() : null,
    }).select().single();

    if (error) throw error;
    res.status(201).json({ status: 'success', message: 'Berita berhasil dibuat', data: { berita: data } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

app.put('/api/berita/:id', authMiddleware, async (req, res) => {
  try {
    const update = {};
    if (req.body.judul) update.judul = req.body.judul;
    if (req.body.konten) update.konten = req.body.konten;
    if (req.body.ringkasan) update.ringkasan = req.body.ringkasan;
    if (req.body.status) update.status = req.body.status;

    const { data, error } = await supabase.from('berita').update(update).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ status: 'success', message: 'Berita berhasil diupdate', data: { berita: data } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

app.delete('/api/berita/:id', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from('berita').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ status: 'success', message: 'Berita berhasil dihapus' });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// ============================================
// PENGUMUMAN
// ============================================
app.get('/api/pengumuman', async (req, res) => {
  try {
    const { data, error } = await supabase.from('pengumuman').select('*').eq('status', 'PUBLISHED').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ status: 'success', data: { items: data || [] } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/pengumuman', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('pengumuman').insert({
      judul: req.body.judul,
      konten: req.body.konten,
      is_pinned: req.body.isPinned || false,
      priority: req.body.priority || 0,
      status: req.body.status || 'PUBLISHED',
      author_id: req.userId,
      published_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    res.status(201).json({ status: 'success', message: 'Pengumuman berhasil dibuat', data: { pengumuman: data } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// ============================================
// AGENDA
// ============================================
app.get('/api/agenda', async (req, res) => {
  try {
    const { data, error } = await supabase.from('agenda').select('*').order('tanggal_mulai', { ascending: true });
    if (error) throw error;
    res.json({ status: 'success', data: { items: data || [] } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/agenda', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('agenda').insert({
      judul: req.body.judul,
      deskripsi: req.body.deskripsi,
      lokasi: req.body.lokasi,
      tanggal_mulai: req.body.tanggalMulai,
      tanggal_selesai: req.body.tanggalSelesai,
      author_id: req.userId,
    }).select().single();
    if (error) throw error;
    res.status(201).json({ status: 'success', message: 'Agenda berhasil dibuat', data: { agenda: data } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// ============================================
// GALERI
// ============================================
app.get('/api/galeri', async (req, res) => {
  try {
    const { data, error } = await supabase.from('galeri').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    res.json({ status: 'success', data: { items: data || [] } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// PPDB
// ============================================
app.post('/api/ppdb', async (req, res) => {
  try {
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
    if (error) throw error;
    res.status(201).json({ status: 'success', message: 'Pendaftaran berhasil', data: { ppdb: data } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

app.get('/api/ppdb/check/:no', async (req, res) => {
  try {
    const { data, error } = await supabase.from('ppdb').select('*').eq('no_pendaftaran', req.params.no).single();
    if (error || !data) return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
    res.json({ status: 'success', data: { ppdb: data } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// DASHBOARD
// ============================================
app.get('/api/dashboard/admin', authMiddleware, async (req, res) => {
  try {
    const [users, berita, pengumuman, ppdb, guru, siswa] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('berita').select('*', { count: 'exact', head: true }),
      supabase.from('pengumuman').select('*', { count: 'exact', head: true }),
      supabase.from('ppdb').select('*', { count: 'exact', head: true }),
      supabase.from('guru').select('*', { count: 'exact', head: true }),
      supabase.from('siswa').select('*', { count: 'exact', head: true }),
    ]);
    res.json({ status: 'success', data: {
      totalUsers: users.count || 0,
      totalBerita: berita.count || 0,
      totalPengumuman: pengumuman.count || 0,
      totalPPDB: ppdb.count || 0,
      totalGuru: guru.count || 0,
      totalSiswa: siswa.count || 0,
    }});
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// USERS
// ============================================
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase.from('users').select('id, email, username, nama_lengkap, foto, is_active, created_at', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ status: 'success', data: { items: data || [], meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) } } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id, email, username, nama_lengkap, foto, no_telp, alamat, is_active, created_at').eq('id', req.userId).single();
    if (error || !data) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', data: { user: data } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/users/stats', authMiddleware, async (req, res) => {
  try {
    const [total, active, inactive] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', false),
    ]);
    res.json({ status: 'success', data: { total: total.count || 0, active: active.count || 0, inactive: inactive.count || 0 } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// GURU
// ============================================
app.get('/api/guru', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('guru').select('*, users!inner(id, nama_lengkap, email, foto)');
    if (error) throw error;
    res.json({ status: 'success', data: { items: data || [] } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// SISWA
// ============================================
app.get('/api/siswa', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('siswa').select('*, users!inner(id, nama_lengkap, email, foto)');
    if (error) throw error;
    res.json({ status: 'success', data: { items: data || [] } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// ABSENSI
// ============================================
app.post('/api/absensi', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('absensi').insert({
      siswa_id: req.body.siswaId,
      status: req.body.status,
      keterangan: req.body.keterangan,
      tanggal: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    res.status(201).json({ status: 'success', message: 'Absensi tercatat', data: { absensi: data } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

app.get('/api/absensi/siswa', authMiddleware, async (req, res) => {
  try {
    const siswaId = req.query.siswaId || req.userId;
    const { data, error } = await supabase.from('absensi').select('*').eq('siswa_id', siswaId).order('tanggal', { ascending: false });
    if (error) throw error;
    res.json({ status: 'success', data: { items: data || [] } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// NOTIFIKASI
// ============================================
app.get('/api/notifikasi', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('notifikasi').select('*').eq('user_id', req.userId).order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    res.json({ status: 'success', data: { items: data || [] } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// PESAN
// ============================================
app.get('/api/pesan/conversations', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('pesan').select('*').or(`pengirim_id.eq.${req.userId},penerima_id.eq.${req.userId}`).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ status: 'success', data: { items: data || [] } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/pesan', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('pesan').insert({
      pengirim_id: req.userId,
      penerima_id: req.body.penerimaId,
      konten: req.body.konten,
    }).select().single();
    if (error) throw error;
    res.status(201).json({ status: 'success', message: 'Pesan terkirim', data: { pesan: data } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// ============================================
// PERPUSTAKAAN
// ============================================
app.get('/api/perpustakaan', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('buku').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ status: 'success', data: { items: data || [] } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// SEARCH
// ============================================
app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ status: 'error', message: 'Query q required' });
    const [berita, users] = await Promise.all([
      supabase.from('berita').select('id, judul, slug, ringkasan').ilike('judul', `%${q}%`).limit(5),
      supabase.from('users').select('id, nama_lengkap, email, foto').ilike('nama_lengkap', `%${q}%`).limit(5),
    ]);
    res.json({ status: 'success', data: { berita: berita.data || [], users: users.data || [] } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// CATCH ALL
// ============================================
app.all('*', (req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.path} not found` });
});

module.exports = app;