// src/services/user.service.ts
import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError';
import { cacheDeletePattern } from '../config/redis';

const userRepository = new UserRepository();

export class UserService {
  async getAll(options: any, filters: any) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { namaLengkap: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.role) {
      where.userRoles = {
        some: { role: { nama: filters.role } },
      };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return userRepository.findAll(options, where);
  }

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User tidak ditemukan', 404);
    
    const { password, refreshToken, ...userWithoutSensitive } = user;
    return userWithoutSensitive;
  }

  async create(data: any) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email sudah digunakan', 400);

    const hashedPassword = await bcrypt.hash(data.password || 'Password123!', 12);
    
    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, data: any) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User tidak ditemukan', 404);

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    const updated = await userRepository.update(id, data);
    await cacheDeletePattern('users:*');

    const { password, refreshToken, ...userWithoutSensitive } = updated;
    return userWithoutSensitive;
  }

  async delete(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User tidak ditemukan', 404);

    await userRepository.delete(id);
    await cacheDeletePattern('users:*');
  }

  async toggleActive(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User tidak ditemukan', 404);

    const updated = await userRepository.update(id, {
      isActive: !user.isActive,
    });

    const { password, refreshToken, ...userWithoutSensitive } = updated;
    return userWithoutSensitive;
  }

  async updateProfile(userId: string, data: any, file?: Express.Multer.File) {
    const updateData: any = { ...data };

    if (file) {
      updateData.foto = `/uploads/images/${file.filename}`;
    }

    const updated = await userRepository.update(userId, updateData);
    const { password, refreshToken, ...userWithoutSensitive } = updated;
    return userWithoutSensitive;
  }
}