// src/services/guru.service.ts
import { GuruRepository } from '../repositories/guru.repository';
import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError';
import prisma from '../config/database';

const guruRepository = new GuruRepository();
const userRepository = new UserRepository();

export class GuruService {
  async getAll(options: any, filters: any) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { nip: { contains: filters.search } },
        { user: { namaLengkap: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.statusPegawai) {
      where.statusPegawai = filters.statusPegawai;
    }

    if (filters.spesialisasi) {
      where.spesialisasi = { contains: filters.spesialisasi, mode: 'insensitive' };
    }

    return guruRepository.findAll(options, where);
  }

  async getById(id: string) {
    const guru = await guruRepository.findById(id);
    if (!guru) throw new AppError('Guru tidak ditemukan', 404);
    return guru;
  }

  async create(data: any) {
    // Create user first
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) throw new AppError('Email sudah digunakan', 400);

    const hashedPassword = await bcrypt.hash(data.password || 'Guru123!', 12);

    const user = await userRepository.create({
      email: data.email,
      username: data.username || data.nip,
      password: hashedPassword,
      namaLengkap: data.namaLengkap,
      noTelp: data.noTelp,
      alamat: data.alamat,
      jenisKelamin: data.jenisKelamin,
      userRoles: {
        create: {
          role: { connect: { nama: 'GURU' } },
        },
      },
    });

    // Create guru profile
    const guru = await guruRepository.create({
      userId: user.id,
      nip: data.nip,
      nuptk: data.nuptk,
      gelarDepan: data.gelarDepan,
      gelarBelakang: data.gelarBelakang,
      spesialisasi: data.spesialisasi,
      pendidikan: data.pendidikan,
      jabatan: data.jabatan,
      statusPegawai: data.statusPegawai,
    });

    return guru;
  }

  async update(id: string, data: any) {
    const guru = await guruRepository.findById(id);
    if (!guru) throw new AppError('Guru tidak ditemukan', 404);

    const updateData: any = {
      nip: data.nip,
      nuptk: data.nuptk,
      gelarDepan: data.gelarDepan,
      gelarBelakang: data.gelarBelakang,
      spesialisasi: data.spesialisasi,
      pendidikan: data.pendidikan,
      jabatan: data.jabatan,
      statusPegawai: data.statusPegawai,
    };

    // Update user data
    if (data.namaLengkap || data.noTelp || data.alamat) {
      await userRepository.update(guru.userId, {
        namaLengkap: data.namaLengkap,
        noTelp: data.noTelp,
        alamat: data.alamat,
      });
    }

    return guruRepository.update(id, updateData);
  }

  async delete(id: string) {
    const guru = await guruRepository.findById(id);
    if (!guru) throw new AppError('Guru tidak ditemukan', 404);

    await guruRepository.delete(id);
    await userRepository.delete(guru.userId);
  }

  async getJadwal(guruId: string) {
    return prisma.jadwal.findMany({
      where: { guruId },
      include: {
        kelas: { select: { id: true, nama: true } },
        mataPelajaran: { select: { id: true, nama: true, kode: true } },
      },
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
    });
  }
}