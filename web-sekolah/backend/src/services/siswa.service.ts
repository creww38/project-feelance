import { SiswaRepository } from '../repositories/siswa.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../utils/pagination';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';

const siswaRepository = new SiswaRepository();
const userRepository = new UserRepository();

export class SiswaService {
  async getAll(options: PaginationOptions, filters: any) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { nis: { contains: filters.search } },
        { nisn: { contains: filters.search } },
        { user: { namaLengkap: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.kelasId) {
      where.kelasId = filters.kelasId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.tahunMasuk) {
      where.tahunMasuk = parseInt(filters.tahunMasuk);
    }

    return siswaRepository.findAll(options, where);
  }

  async getById(id: string) {
    const siswa = await siswaRepository.findById(id);
    if (!siswa) {
      throw new AppError('Siswa tidak ditemukan', 404);
    }
    return siswa;
  }

  async getByUserId(userId: string) {
    const siswa = await siswaRepository.findByUserId(userId);
    if (!siswa) {
      throw new AppError('Data siswa tidak ditemukan', 404);
    }
    return siswa;
  }

  async getByKelas(kelasId: string) {
    return siswaRepository.findByKelas(kelasId);
  }

  async create(data: any) {
    // Check uniqueness
    const existingNis = await siswaRepository.findByNis(data.nis);
    if (existingNis) {
      throw new AppError('NIS sudah digunakan', 400);
    }

    if (data.nisn) {
      const existingNisn = await siswaRepository.findByNisn(data.nisn);
      if (existingNisn) {
        throw new AppError('NISN sudah digunakan', 400);
      }
    }

    // Check kelas capacity
    const kelas = await prisma.kelas.findUnique({
      where: { id: data.kelasId },
      include: { _count: { select: { siswa: true } } },
    });

    if (kelas && kelas._count.siswa >= (kelas.kapasitas || 30)) {
      throw new AppError('Kelas sudah penuh', 400);
    }

    // Create user
    const hashedPassword = await bcrypt.hash(data.password || 'Siswa123!', 12);
    const user = await userRepository.create({
      email: data.email,
      username: data.username,
      password: hashedPassword,
      namaLengkap: data.namaLengkap,
      noTelp: data.noTelp,
      alamat: data.alamat,
      jenisKelamin: data.jenisKelamin,
      userRoles: {
        create: {
          role: { connect: { nama: 'SISWA' } },
        },
      },
    });

    // Create siswa profile
    const siswa = await siswaRepository.create({
      userId: user.id,
      nis: data.nis,
      nisn: data.nisn,
      nik: data.nik,
      noKK: data.noKK,
      kelasId: data.kelasId,
      tahunMasuk: data.tahunMasuk,
    });

    return siswaRepository.findById(siswa.id);
  }

  async update(id: string, data: any) {
    const siswa = await siswaRepository.findById(id);
    if (!siswa) {
      throw new AppError('Siswa tidak ditemukan', 404);
    }

    // Update user data
    if (data.namaLengkap || data.noTelp || data.alamat) {
      await userRepository.update(siswa.userId, {
        namaLengkap: data.namaLengkap,
        noTelp: data.noTelp,
        alamat: data.alamat,
      });
    }

    // Update siswa data
    const { namaLengkap, noTelp, alamat, ...siswaData } = data;
    return siswaRepository.update(id, siswaData);
  }

  async delete(id: string) {
    const siswa = await siswaRepository.findById(id);
    if (!siswa) {
      throw new AppError('Siswa tidak ditemukan', 404);
    }

    await userRepository.update(siswa.userId, { isActive: false });
    await siswaRepository.update(id, { status: 'KELUAR' });
    return { message: 'Siswa berhasil dinonaktifkan' };
  }

  async naikKelas(siswaIds: string[], kelasBaruId: string) {
    const kelas = await prisma.kelas.findUnique({ where: { id: kelasBaruId } });
    if (!kelas) {
      throw new AppError('Kelas tujuan tidak ditemukan', 404);
    }

    const results = [];
    for (const siswaId of siswaIds) {
      const updated = await siswaRepository.update(siswaId, { kelasId: kelasBaruId });
      results.push(updated);
    }

    return results;
  }

  async luluskan(siswaIds: string[], tahunLulus: number) {
    const results = [];
    for (const siswaId of siswaIds) {
      const siswa = await siswaRepository.findById(siswaId);
      if (!siswa) continue;

      // Update status to LULUS
      await siswaRepository.update(siswaId, { status: 'LULUS' });

      // Create alumni record
      await prisma.alumni.create({
        data: {
          siswaId,
          tahunLulus,
          jurusan: siswa.kelas?.jurusan?.nama,
        },
      });

      results.push(siswaId);
    }

    return results;
  }

  async getStats() {
    const totalSiswa = await siswaRepository.count();
    const perKelas = await prisma.kelas.findMany({
      include: {
        _count: { select: { siswa: true } },
        jurusan: { select: { nama: true } },
      },
      orderBy: { nama: 'asc' },
    });

    return {
      totalSiswa,
      perKelas: perKelas.map((k) => ({
        kelas: k.nama,
        jurusan: k.jurusan.nama,
        jumlah: k._count.siswa,
      })),
    };
  }
}