import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis';

export class SettingService {
  async getAll() {
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
    return settings;
  }

  async getByKey(key: string) {
    const cacheKey = `setting:${key}`;
    const cached = await cacheGet(cacheKey);

    if (cached) return JSON.parse(cached);

    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      throw new AppError('Setting tidak ditemukan', 404);
    }

    await cacheSet(cacheKey, JSON.stringify(setting), 3600);
    return setting;
  }

  async getValue(key: string, defaultValue: string = ''): Promise<string> {
    try {
      const setting = await this.getByKey(key);
      return setting.value;
    } catch {
      return defaultValue;
    }
  }

  async set(key: string, value: string, deskripsi?: string): Promise<void> {
    await prisma.setting.upsert({
      where: { key },
      update: { value, deskripsi },
      create: { key, value, deskripsi },
    });

    await cacheDelete(`setting:${key}`);
  }

  async update(id: string, data: any) {
    const existing = await prisma.setting.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Setting tidak ditemukan', 404);
    }

    const updated = await prisma.setting.update({
      where: { id },
      data,
    });

    await cacheDelete(`setting:${updated.key}`);
    return updated;
  }

  async getPublicSettings() {
    const publicKeys = [
      'school_name', 'school_short_name', 'school_address',
      'school_phone', 'school_email', 'school_website',
      'accreditation', 'headmaster_name', 'headmaster_photo',
      'headmaster_greeting', 'vision', 'mission',
      'school_logo', 'school_favicon', 'school_hero_image',
      'social_facebook', 'social_instagram', 'social_twitter',
      'social_youtube', 'ppdb_is_open',
    ];

    const settings = await prisma.setting.findMany({
      where: { key: { in: publicKeys } },
    });

    const result: any = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return result;
  }
}