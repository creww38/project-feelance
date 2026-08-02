import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SeedSetting {
  key: string;
  value: string;
  deskripsi: string;
  tipe: string;
}

export const seedSettings: SeedSetting[] = [
  // Sekolah Info
  {
    key: 'school_name',
    value: 'SMA Negeri 1',
    deskripsi: 'Nama Sekolah',
    tipe: 'text',
  },
  {
    key: 'school_short_name',
    value: 'SMANSA',
    deskripsi: 'Singkatan Nama Sekolah',
    tipe: 'text',
  },
  {
    key: 'school_address',
    value: 'Jl. Pendidikan No. 1, Jakarta Pusat',
    deskripsi: 'Alamat Sekolah',
    tipe: 'text',
  },
  {
    key: 'school_phone',
    value: '(021) 1234567',
    deskripsi: 'Nomor Telepon Sekolah',
    tipe: 'text',
  },
  {
    key: 'school_email',
    value: 'info@smansa.sch.id',
    deskripsi: 'Email Sekolah',
    tipe: 'text',
  },
  {
    key: 'school_website',
    value: 'https://smansa.sch.id',
    deskripsi: 'Website Sekolah',
    tipe: 'text',
  },

  // Akreditasi
  {
    key: 'accreditation',
    value: 'A',
    deskripsi: 'Akreditasi Sekolah',
    tipe: 'text',
  },
  {
    key: 'accreditation_year',
    value: '2023',
    deskripsi: 'Tahun Akreditasi',
    tipe: 'number',
  },

  // Kepala Sekolah
  {
    key: 'headmaster_name',
    value: 'Dr. H. Ahmad Fauzi, M.Pd',
    deskripsi: 'Nama Kepala Sekolah',
    tipe: 'text',
  },
  {
    key: 'headmaster_nip',
    value: '196501011990031001',
    deskripsi: 'NIP Kepala Sekolah',
    tipe: 'text',
  },
  {
    key: 'headmaster_photo',
    value: '/images/kepala-sekolah.jpg',
    deskripsi: 'Foto Kepala Sekolah',
    tipe: 'file',
  },
  {
    key: 'headmaster_greeting',
    value: 'Assalamualaikum Warahmatullahi Wabarakatuh. Selamat datang di website resmi SMA Negeri 1. Kami berkomitmen untuk memberikan pendidikan terbaik bagi putra-putri bangsa.',
    deskripsi: 'Sambutan Kepala Sekolah',
    tipe: 'text',
  },

  // Visi Misi
  {
    key: 'vision',
    value: 'Menjadi sekolah unggulan yang menghasilkan lulusan berprestasi, berkarakter, dan berwawasan global.',
    deskripsi: 'Visi Sekolah',
    tipe: 'text',
  },
  {
    key: 'mission',
    value: JSON.stringify([
      'Menyelenggarakan pembelajaran berkualitas berbasis teknologi',
      'Mengembangkan potensi peserta didik secara holistik',
      'Membangun karakter dan budi pekerti luhur',
      'Meningkatkan profesionalisme tenaga pendidik',
      'Menciptakan lingkungan sekolah yang aman dan nyaman',
    ]),
    deskripsi: 'Misi Sekolah',
    tipe: 'json',
  },

  // Logo & Media
  {
    key: 'school_logo',
    value: '/images/logo-sekolah.png',
    deskripsi: 'Logo Sekolah',
    tipe: 'file',
  },
  {
    key: 'school_favicon',
    value: '/favicon.ico',
    deskripsi: 'Favicon Website',
    tipe: 'file',
  },
  {
    key: 'school_hero_image',
    value: '/images/hero-sekolah.jpg',
    deskripsi: 'Gambar Hero Website',
    tipe: 'file',
  },

  // Social Media
  {
    key: 'social_facebook',
    value: 'https://facebook.com/smansa',
    deskripsi: 'Facebook Sekolah',
    tipe: 'text',
  },
  {
    key: 'social_instagram',
    value: 'https://instagram.com/smansa.official',
    deskripsi: 'Instagram Sekolah',
    tipe: 'text',
  },
  {
    key: 'social_twitter',
    value: 'https://twitter.com/smansa',
    deskripsi: 'Twitter Sekolah',
    tipe: 'text',
  },
  {
    key: 'social_youtube',
    value: 'https://youtube.com/smansa',
    deskripsi: 'Youtube Sekolah',
    tipe: 'text',
  },

  // SEO
  {
    key: 'seo_title',
    value: 'SMA Negeri 1 - Sekolah Unggulan Berprestasi',
    deskripsi: 'SEO Title',
    tipe: 'text',
  },
  {
    key: 'seo_description',
    value: 'Website resmi SMA Negeri 1. Sekolah terakreditasi A dengan berbagai program unggulan dan prestasi tingkat nasional.',
    deskripsi: 'SEO Description',
    tipe: 'text',
  },
  {
    key: 'seo_keywords',
    value: 'sma negeri 1, smansa, sekolah unggulan, ppdb, prestasi',
    deskripsi: 'SEO Keywords',
    tipe: 'text',
  },

  // Google Analytics
  {
    key: 'google_analytics_id',
    value: '',
    deskripsi: 'Google Analytics ID',
    tipe: 'text',
  },

  // SMTP Settings
  {
    key: 'smtp_host',
    value: 'smtp.gmail.com',
    deskripsi: 'SMTP Host',
    tipe: 'text',
  },
  {
    key: 'smtp_port',
    value: '587',
    deskripsi: 'SMTP Port',
    tipe: 'number',
  },
  {
    key: 'smtp_from_name',
    value: 'SMA Negeri 1',
    deskripsi: 'SMTP From Name',
    tipe: 'text',
  },

  // PPDB Settings
  {
    key: 'ppdb_is_open',
    value: 'true',
    deskripsi: 'Status PPDB',
    tipe: 'boolean',
  },
  {
    key: 'ppdb_start_date',
    value: '2024-06-01',
    deskripsi: 'Tanggal Mulai PPDB',
    tipe: 'date',
  },
  {
    key: 'ppdb_end_date',
    value: '2024-07-15',
    deskripsi: 'Tanggal Selesai PPDB',
    tipe: 'date',
  },
  {
    key: 'ppdb_quota',
    value: '360',
    deskripsi: 'Kuota PPDB',
    tipe: 'number',
  },

  // Fitur
  {
    key: 'feature_chat',
    value: 'true',
    deskripsi: 'Aktifkan Fitur Chat',
    tipe: 'boolean',
  },
  {
    key: 'feature_elearning',
    value: 'true',
    deskripsi: 'Aktifkan E-Learning',
    tipe: 'boolean',
  },
  {
    key: 'feature_perpustakaan',
    value: 'true',
    deskripsi: 'Aktifkan Perpustakaan Digital',
    tipe: 'boolean',
  },
];

export async function createSeedSettings(): Promise<void> {
  console.log('⚙️  Creating seed settings...');

  for (const setting of seedSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        deskripsi: setting.deskripsi,
        tipe: setting.tipe,
      },
      create: {
        key: setting.key,
        value: setting.value,
        deskripsi: setting.deskripsi,
        tipe: setting.tipe,
      },
    });
  }
  console.log(`  ✅ Created ${seedSettings.length} settings`);
}

export default seedSettings;