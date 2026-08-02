// src/services/user.service.ts
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { paginate, PaginationOptions, PaginationResult } from '../utils/pagination';
import prisma from '../config/database';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAll(options: PaginationOptions, filters: any) {
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
        some: {
          role: { nama: filters.role },
        },
      };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true';
    }

    return this.userRepository.findAll(options, where);
  }

  async getById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    const { password, refreshToken, ...userWithoutSensitive } = user;
    return userWithoutSensitive;
  }

  async create(data: any) {
    // Check unique constraints
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError('Email sudah digunakan', 400);
    }

    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new AppError('Username sudah digunakan', 400);
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, data: any) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    // Check unique constraints if changing
    if (data.email && data.email !== user.email) {
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppError('Email sudah digunakan', 400);
      }
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await this.userRepository.findByUsername(data.username);
      if (existingUsername) {
        throw new AppError('Username sudah digunakan', 400);
      }
    }

    return this.userRepository.update(id, data);
  }

  async delete(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    // Soft delete - deactivate
    return this.userRepository.update(id, { isActive: false });
  }

  async updateProfile(userId: string, data: any) {
    return this.userRepository.update(userId, data);
  }

  async uploadAvatar(userId: string, fileUrl: string) {
    return this.userRepository.update(userId, { foto: fileUrl });
  }
}