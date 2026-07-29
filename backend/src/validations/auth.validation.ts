// src/validations/auth.validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z.object({
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
  role: z.enum(['GURU', 'SISWA', 'STAFF_TU', 'ORANG_TUA']).optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Password lama harus diisi'),
  newPassword: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password harus mengandung huruf besar, kecil, dan angka'
    ),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password harus mengandung huruf besar, kecil, dan angka'
    ),
});