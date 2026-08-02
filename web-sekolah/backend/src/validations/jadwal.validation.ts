// src/validations/jadwal.validation.ts
import { z } from 'zod';

export const jadwalSchema = z.object({
  kelasId: z.string().uuid('Kelas harus dipilih'),
  mataPelajaranId: z.string().uuid('Mata pelajaran harus dipilih'),
  guruId: z.string().uuid('Guru harus dipilih'),
  hari: z.enum(['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']),
  jamMulai: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format jam tidak valid (HH:MM)'),
  jamSelesai: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format jam tidak valid (HH:MM)'),
  ruangan: z.string().optional(),
});