// src/validations/common.validation.ts
import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID harus diisi'),
});