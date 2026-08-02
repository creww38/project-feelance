import { Request } from 'express';
import { RoleType, StatusPPDB, JenisKelamin, StatusBerita, Hari } from './enums';

// Express Request Extension
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    namaLengkap: string;
    foto: string | null;
    isActive: boolean;
    userRoles: UserRole[];
    guru?: GuruInfo | null;
    siswa?: SiswaInfo | null;
    orangTua?: OrangTuaInfo | null;
  };
}

// User Types
export interface UserInfo {
  id: string;
  email: string;
  username: string;
  namaLengkap: string;
  foto: string | null;
  noTelp: string | null;
  alamat: string | null;
  jenisKelamin: JenisKelamin | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}

export interface UserRole {
  id: string;
  role: RoleInfo;
}

export interface RoleInfo {
  id: string;
  nama: RoleType;
  deskripsi: string | null;
  rolePermissions: RolePermission[];
}

export interface RolePermission {
  id: string;
  permission: PermissionInfo;
}

export interface PermissionInfo {
  id: string;
  nama: string;
  resource: string;
  action: string;
}

// Guru Types
export interface GuruInfo {
  id: string;
  nip: string;
  nuptk: string | null;
  gelarDepan: string | null;
  gelarBelakang: string | null;
  spesialisasi: string | null;
  jabatan: string | null;
}

export interface CreateGuruDTO {
  email: string;
  username: string;
  password: string;
  namaLengkap: string;
  nip: string;
  nuptk?: string;
  gelarDepan?: string;
  gelarBelakang?: string;
  spesialisasi?: string;
  jabatan?: string;
  jenisKelamin?: JenisKelamin;
  noTelp?: string;
  alamat?: string;
}

export interface UpdateGuruDTO {
  namaLengkap?: string;
  nip?: string;
  nuptk?: string;
  spesialisasi?: string;
  jabatan?: string;
  noTelp?: string;
  alamat?: string;
}

// Siswa Types
export interface SiswaInfo {
  id: string;
  nis: string;
  nisn: string;
  kelas: KelasInfo;
}

export interface KelasInfo {
  id: string;
  nama: string;
  tingkat: number;
  jurusan: JurusanInfo;
}

export interface JurusanInfo {
  id: string;
  kode: string;
  nama: string;
}

export interface CreateSiswaDTO {
  email: string;
  username: string;
  password: string;
  namaLengkap: string;
  nis: string;
  nisn: string;
  kelasId: string;
  tahunMasuk: number;
  jenisKelamin?: JenisKelamin;
  noTelp?: string;
  alamat?: string;
}

// Orang Tua Types
export interface OrangTuaInfo {
  id: string;
  siswaId: string;
  hubungan: string;
  pekerjaan: string | null;
}

// Berita Types
export interface CreateBeritaDTO {
  judul: string;
  konten: string;
  ringkasan?: string;
  gambar?: string;
  kategoriId: string;
  tagIds?: string[];
  isFeatured?: boolean;
  status?: StatusBerita;
}

export interface UpdateBeritaDTO {
  judul?: string;
  konten?: string;
  ringkasan?: string;
  gambar?: string;
  kategoriId?: string;
  tagIds?: string[];
  isFeatured?: boolean;
  status?: StatusBerita;
}

// PPDB Types
export interface CreatePPDBDTO {
  namaLengkap: string;
  nisn?: string;
  nik?: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  noTelp: string;
  email?: string;
  asalSekolah?: string;
  namaOrtu: string;
  noTelpOrtu: string;
  jurusanId: string;
  tahunAjaranId: string;
}

// Absensi Types
export interface RecordAbsensiDTO {
  siswaId: string;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPHA' | 'TERLAMBAT';
  keterangan?: string;
}

// Jadwal Types
export interface CreateJadwalDTO {
  kelasId: string;
  mataPelajaranId: string;
  guruId: string;
  hari: Hari;
  jamMulai: string;
  jamSelesai: string;
  ruangan?: string;
}

// E-Learning Types
export interface CreateMateriDTO {
  judul: string;
  deskripsi?: string;
  konten?: string;
  fileUrl?: string;
  videoUrl?: string;
  mataPelajaranId: string;
  kelasId?: string;
}

export interface CreateTugasDTO {
  judul: string;
  deskripsi: string;
  deadline: Date;
  fileUrl?: string;
  tipe?: 'TUGAS' | 'PROYEK' | 'UJIAN';
  bobot?: number;
  mataPelajaranId: string;
  kelasId?: string;
}

export interface SubmitJawabanDTO {
  konten?: string;
  fileUrl?: string;
}

// Nilai Types
export interface CreateNilaiDTO {
  siswaId: string;
  mataPelajaranId: string;
  semester: number;
  nilaiTugas?: number;
  nilaiUTS?: number;
  nilaiUAS?: number;
}

// Perpustakaan Types
export interface CreateBukuDTO {
  kode: string;
  isbn?: string;
  judul: string;
  pengarang: string;
  penerbit?: string;
  tahun?: number;
  kategori?: string;
  jumlah: number;
  lokasi?: string;
}

export interface PinjamBukuDTO {
  bukuId: string;
  userId: string;
}

// Pesan Types
export interface SendMessageDTO {
  penerimaId: string;
  konten: string;
}

// Notifikasi Types
export interface CreateNotifikasiDTO {
  userId: string;
  judul: string;
  konten: string;
  tipe?: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  link?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Dashboard Types
export interface AdminDashboardStats {
  totalGuru: number;
  totalSiswa: number;
  totalStaff: number;
  totalBerita: number;
  totalGaleri: number;
  totalPengumuman: number;
  totalAgenda: number;
  totalAlumni: number;
  totalPengunjung: number;
  ppdbStats: {
    pendaftar: number;
    diterima: number;
    ditolak: number;
    pending: number;
  };
  visitorChart: {
    labels: string[];
    data: number[];
  };
  siswaChart: {
    labels: string[];
    data: number[];
  };
}

export interface GuruDashboardStats {
  jadwalHariIni: number;
  totalMateri: number;
  totalTugas: number;
  siswaWali: number;
}

export interface SiswaDashboardStats {
  jadwalHariIni: number;
  tugasPending: number;
  absensi: number;
}

export interface OrangTuaDashboardStats {
  absensiTerbaru: any[];
  nilaiRata: number;
  tugasPending: number;
}

// Setting Types
export interface UpdateSettingDTO {
  value: string;
  deskripsi?: string;
}

// Search Types
export interface SearchResults {
  berita: { items: any[]; total: number };
  guru: { items: any[]; total: number };
  siswa: { items: any[]; total: number };
  buku: { items: any[]; total: number };
}