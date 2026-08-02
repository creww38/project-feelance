// src/validations/berita.validation.ts
import { z } from 'zod';

export const beritaSchema = z.object({
  judul: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(200, 'Judul maksimal 200 karakter'),
  konten: z.string().min(10, 'Konten minimal 10 karakter'),
  ringkasan: z.string().max(500, 'Ringkasan maksimal 500 karakter').optional(),
  gambar: z.string().optional(),
  kategoriId: z.string().uuid('Kategori tidak valid'),
  tagIds: z.array(z.string().uuid()).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const komentarSchema = z.object({
  konten: z
    .string()
    .min(1, 'Komentar tidak boleh kosong')
    .max(1000, 'Komentar maksimal 1000 karakter'),
  parentId: z.string().uuid().optional(),
});