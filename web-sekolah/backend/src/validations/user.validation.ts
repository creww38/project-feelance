// src/validations/user.validation.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password harus mengandung huruf besar, kecil, dan angka'
    ),
  namaLengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  noTelp: z.string().optional(),
  jenisKelamin: z.enum(['L', 'P']).optional(),
  role: z.enum(['ADMIN', 'KEPALA_SEKOLAH', 'GURU', 'STAFF_TU', 'SISWA', 'ORANG_TUA']),
});

export const updateUserSchema = z.object({
  namaLengkap: z.string().min(3).optional(),
  noTelp: z.string().optional(),
  alamat: z.string().optional(),
  jenisKelamin: z.enum(['L', 'P']).optional(),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
  foto: z.string().optional(),
});

export const updateProfileSchema = z.object({
  namaLengkap: z.string().min(3).optional(),
  noTelp: z.string().optional(),
  alamat: z.string().optional(),
  foto: z.string().optional(),
});