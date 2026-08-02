// src/validations/ppdb.validation.ts
import { z } from 'zod';

export const ppdbSchema = z.object({
  namaLengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  nisn: z.string().length(10, 'NISN harus 10 digit').optional(),
  nik: z.string().length(16, 'NIK harus 16 digit').optional(),
  jenisKelamin: z.enum(['L', 'P'], { required_error: 'Jenis kelamin harus dipilih' }),
  tempatLahir: z.string().min(1, 'Tempat lahir harus diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir harus diisi'),
  alamat: z.string().min(10, 'Alamat minimal 10 karakter'),
  noTelp: z.string().min(10, 'Nomor telepon tidak valid'),
  email: z.string().email('Email tidak valid').optional(),
  asalSekolah: z.string().optional(),
  namaOrtu: z.string().min(3, 'Nama orang tua harus diisi'),
  noTelpOrtu: z.string().min(10, 'Nomor telepon orang tua tidak valid'),
  jurusanId: z.string().uuid('Jurusan harus dipilih'),
  tahunAjaranId: z.string().uuid('Tahun ajaran harus dipilih'),
});

export const updateStatusPPDBSchema = z.object({
  status: z.enum(['VERIFIED', 'ACCEPTED', 'REJECTED']),
  catatan: z.string().optional(),
});