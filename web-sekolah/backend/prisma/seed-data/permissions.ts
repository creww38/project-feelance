// prisma/seed-data/permissions.ts
export const permissionData = [
  // User Management
  { nama: 'MANAGE_USERS', resource: 'users', action: 'MANAGE' },
  { nama: 'VIEW_USERS', resource: 'users', action: 'READ' },
  { nama: 'CREATE_USER', resource: 'users', action: 'CREATE' },
  { nama: 'UPDATE_USER', resource: 'users', action: 'UPDATE' },
  { nama: 'DELETE_USER', resource: 'users', action: 'DELETE' },

  // Berita
  { nama: 'MANAGE_BERITA', resource: 'berita', action: 'MANAGE' },
  { nama: 'VIEW_BERITA', resource: 'berita', action: 'READ' },
  { nama: 'CREATE_BERITA', resource: 'berita', action: 'CREATE' },
  { nama: 'UPDATE_BERITA', resource: 'berita', action: 'UPDATE' },
  { nama: 'DELETE_BERITA', resource: 'berita', action: 'DELETE' },

  // Galeri
  { nama: 'MANAGE_GALERI', resource: 'galeri', action: 'MANAGE' },
  { nama: 'VIEW_GALERI', resource: 'galeri', action: 'READ' },
  { nama: 'UPLOAD_GALERI', resource: 'galeri', action: 'CREATE' },
  { nama: 'DELETE_GALERI', resource: 'galeri', action: 'DELETE' },

  // Pengumuman
  { nama: 'MANAGE_PENGUMUMAN', resource: 'pengumuman', action: 'MANAGE' },
  { nama: 'VIEW_PENGUMUMAN', resource: 'pengumuman', action: 'READ' },
  { nama: 'CREATE_PENGUMUMAN', resource: 'pengumuman', action: 'CREATE' },

  // PPDB
  { nama: 'MANAGE_PPDB', resource: 'ppdb', action: 'MANAGE' },
  { nama: 'VIEW_PPDB', resource: 'ppdb', action: 'READ' },
  { nama: 'PROCESS_PPDB', resource: 'ppdb', action: 'UPDATE' },

  // E-Learning
  { nama: 'MANAGE_ELEARNING', resource: 'elearning', action: 'MANAGE' },
  { nama: 'VIEW_ELEARNING', resource: 'elearning', action: 'READ' },
  { nama: 'CREATE_MATERI', resource: 'elearning', action: 'CREATE' },
  { nama: 'CREATE_TUGAS', resource: 'elearning', action: 'CREATE' },
  { nama: 'GRADE_TUGAS', resource: 'elearning', action: 'UPDATE' },

  // Absensi
  { nama: 'MANAGE_ABSENSI', resource: 'absensi', action: 'MANAGE' },
  { nama: 'VIEW_ABSENSI', resource: 'absensi', action: 'READ' },
  { nama: 'RECORD_ABSENSI', resource: 'absensi', action: 'CREATE' },

  // Nilai
  { nama: 'MANAGE_NILAI', resource: 'nilai', action: 'MANAGE' },
  { nama: 'VIEW_NILAI', resource: 'nilai', action: 'READ' },
  { nama: 'INPUT_NILAI', resource: 'nilai', action: 'CREATE' },

  // Perpustakaan
  { nama: 'MANAGE_PERPUSTAKAAN', resource: 'perpustakaan', action: 'MANAGE' },
  { nama: 'VIEW_PERPUSTAKAAN', resource: 'perpustakaan', action: 'READ' },
  { nama: 'BORROW_BUKU', resource: 'perpustakaan', action: 'CREATE' },

  // Alumni
  { nama: 'MANAGE_ALUMNI', resource: 'alumni', action: 'MANAGE' },
  { nama: 'VIEW_ALUMNI', resource: 'alumni', action: 'READ' },

  // Settings
  { nama: 'MANAGE_SETTINGS', resource: 'settings', action: 'MANAGE' },
  { nama: 'VIEW_SETTINGS', resource: 'settings', action: 'READ' },

  // Dashboard
  { nama: 'VIEW_DASHBOARD', resource: 'dashboard', action: 'READ' },
  { nama: 'VIEW_ADMIN_DASHBOARD', resource: 'dashboard', action: 'MANAGE' },
];

export const rolePermissionsMap = {
  ADMIN: ['MANAGE_USERS', 'MANAGE_BERITA', 'MANAGE_GALERI', 'MANAGE_PENGUMUMAN', 'MANAGE_PPDB', 'MANAGE_ELEARNING', 'MANAGE_ABSENSI', 'MANAGE_NILAI', 'MANAGE_PERPUSTAKAAN', 'MANAGE_ALUMNI', 'MANAGE_SETTINGS', 'VIEW_ADMIN_DASHBOARD'],
  KEPALA_SEKOLAH: ['VIEW_USERS', 'VIEW_BERITA', 'VIEW_GALERI', 'VIEW_PENGUMUMAN', 'VIEW_PPDB', 'VIEW_ELEARNING', 'VIEW_ABSENSI', 'VIEW_NILAI', 'VIEW_PERPUSTAKAAN', 'VIEW_ALUMNI', 'VIEW_SETTINGS', 'VIEW_DASHBOARD'],
  GURU: ['VIEW_BERITA', 'CREATE_BERITA', 'VIEW_GALERI', 'VIEW_PENGUMUMAN', 'VIEW_ELEARNING', 'CREATE_MATERI', 'CREATE_TUGAS', 'GRADE_TUGAS', 'RECORD_ABSENSI', 'VIEW_ABSENSI', 'INPUT_NILAI', 'VIEW_NILAI', 'VIEW_DASHBOARD'],
  STAFF_TU: ['VIEW_USERS', 'CREATE_USER', 'VIEW_BERITA', 'CREATE_BERITA', 'UPLOAD_GALERI', 'CREATE_PENGUMUMAN', 'VIEW_PPDB', 'PROCESS_PPDB', 'VIEW_ABSENSI', 'VIEW_NILAI', 'VIEW_PERPUSTAKAAN', 'VIEW_DASHBOARD'],
  SISWA: ['VIEW_BERITA', 'VIEW_GALERI', 'VIEW_PENGUMUMAN', 'VIEW_ELEARNING', 'VIEW_ABSENSI', 'VIEW_NILAI', 'BORROW_BUKU', 'VIEW_DASHBOARD'],
  ORANG_TUA: ['VIEW_BERITA', 'VIEW_PENGUMUMAN', 'VIEW_ABSENSI', 'VIEW_NILAI', 'VIEW_DASHBOARD'],
  GUEST: ['VIEW_BERITA', 'VIEW_GALERI', 'VIEW_PENGUMUMAN'],
};