// src/services/siswa.service.ts
import { SiswaRepository } from '../repositories/siswa.repository';
import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError';
import * as XLSX from 'xlsx';

const siswaRepository = new SiswaRepository();
const userRepository = new UserRepository();

export class SiswaService {
  async getAll(options: any, filters: any) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { nis: { contains: filters.search } },
        { nisn: { contains: filters.search } },
        { user: { namaLengkap: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.kelasId) where.kelasId = filters.kelasId;
    if (filters.status) where.status = filters.status;
    if (filters.tahunMasuk) where.tahunMasuk = filters.tahunMasuk;

    if (filters.jurusanId) {
      where.kelas = { jurusanId: filters.jurusanId };
    }

    return siswaRepository.findAll(options, where);
  }

  async getById(id: string) {
    const siswa = await siswaRepository.findById(id);
    if (!siswa) throw new AppError('Siswa tidak ditemukan', 404);
    return siswa;
  }

  async create(data: any) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) throw new AppError('Email sudah digunakan', 400);

    const hashedPassword = await bcrypt.hash(data.password || 'Siswa123!', 12);

    const user = await userRepository.create({
      email: data.email,
      username: data.username || data.nis,
      password: hashedPassword,
      namaLengkap: data.namaLengkap,
      noTelp: data.noTelp,
      alamat: data.alamat,
      jenisKelamin: data.jenisKelamin,
      tempatLahir: data.tempatLahir,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
      userRoles: {
        create: {
          role: { connect: { nama: 'SISWA' } },
        },
      },
    });

    const siswa = await siswaRepository.create({
      userId: user.id,
      nis: data.nis,
      nisn: data.nisn,
      nik: data.nik,
      noKK: data.noKK,
      kelasId: data.kelasId,
      tahunMasuk: data.tahunMasuk,
    });

    return siswa;
  }

  async update(id: string, data: any) {
    const siswa = await siswaRepository.findById(id);
    if (!siswa) throw new AppError('Siswa tidak ditemukan', 404);

    if (data.namaLengkap || data.noTelp) {
      await userRepository.update(siswa.userId, {
        namaLengkap: data.namaLengkap,
        noTelp: data.noTelp,
        alamat: data.alamat,
      });
    }

    return siswaRepository.update(id, data);
  }

  async delete(id: string) {
    const siswa = await siswaRepository.findById(id);
    if (!siswa) throw new AppError('Siswa tidak ditemukan', 404);

    await siswaRepository.delete(id);
    await userRepository.delete(siswa.userId);
  }

  async getByKelas(kelasId: string) {
    return siswaRepository.findByKelas(kelasId);
  }

  async importExcel(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const row of data as any[]) {
      try {
        await this.create({
          nis: row.nis?.toString(),
          nisn: row.nisn?.toString(),
          namaLengkap: row.nama_lengkap,
          email: row.email,
          kelasId: row.kelas_id,
          tahunMasuk: parseInt(row.tahun_masuk),
          jenisKelamin: row.jenis_kelamin === 'L' ? 'L' : 'P',
        });
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${results.success + results.failed}: ${error.message}`);
      }
    }

    return results;
  }

  async exportExcel(filters: any) {
    const siswa = await this.getAll({ page: 1, limit: 10000 }, filters);
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      siswa.items.map((s: any) => ({
        NIS: s.nis,
        NISN: s.nisn,
        Nama: s.user.namaLengkap,
        Kelas: s.kelas.nama,
        'Jenis Kelamin': s.user.jenisKelamin,
        'Tahun Masuk': s.tahunMasuk,
        Status: s.status,
      }))
    );
    
    XLSX.utils.book_append_sheet(wb, ws, 'Siswa');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}