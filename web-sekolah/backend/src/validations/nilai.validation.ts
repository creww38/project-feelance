// src/validations/nilai.validation.ts
import { z } from 'zod';

export const nilaiSchema = z.object({
  siswaId: z.string().uuid('Siswa harus dipilih'),
  mataPelajaranId: z.string().uuid('Mata pelajaran harus dipilih'),
  semester: z.number().min(1).max(6),
  nilaiTugas: z.number().min(0).max(100).optional(),
  nilaiUTS: z.number().min(0).max(100).optional(),
  nilaiUAS: z.number().min(0).max(100).optional(),
  nilaiAkhir: z.number().min(0).max(100).optional(),
  grade: z.string().optional(),
  predikat: z.string().optional(),
});

export const importNilaiSchema = z.object({
  siswaId: z.string().uuid(),
  mataPelajaranId: z.string().uuid(),
  nilai: z.number().min(0).max(100),
});