// src/services/setting.service.ts
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { cacheDeletePattern } from '../config/redis';

export class SettingService {
  async getAll() {
    return prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async getPublic() {
    const publicKeys = [
      'school_name', 'school_short_name', 'school_logo', 'school_address',
      'school_phone', 'school_email', 'school_website', 'accreditation',
      'school_motto', 'school_vision', 'school_mission',
      'social_facebook', 'social_instagram', 'social_youtube', 'social_twitter',
      'seo_title', 'seo_description', 'seo_keywords',
      'ppdb_open', 'ppdb_year', 'ppdb_quota',
    ];

    return prisma.setting.findMany({
      where: { key: { in: publicKeys } },
    });
  }

  async getByKey(key: string) {
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new AppError('Setting tidak ditemukan', 404);
    return setting;
  }

  async update(key: string, value: string, deskripsi?: string) {
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value, deskripsi },
      create: { key, value, deskripsi },
    });

    await cacheDeletePattern('settings:*');
    return setting;
  }

  async updateBulk(settings: Array<{ key: string; value: string }>) {
    const results = [];
    for (const s of settings) {
      const result = await this.update(s.key, s.value);
      results.push(result);
    }
    return results;
  }

  async backup() {
    const [users, settings, berita, galeri] = await Promise.all([
      prisma.user.findMany(),
      prisma.setting.findMany(),
      prisma.berita.findMany(),
      prisma.galeri.findMany(),
    ]);

    return {
      users,
      settings,
      berita,
      galeri,
      backupDate: new Date().toISOString(),
    };
  }

  async restore(data: any) {
    // This is a simplified restore - in production, handle this more carefully
    if (data.settings) {
      for (const setting of data.settings) {
        await prisma.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: setting,
        });
      }
    }
  }
}