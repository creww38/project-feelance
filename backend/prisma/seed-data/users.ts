// prisma/seed-data/users.ts
import bcrypt from 'bcryptjs';

export const userData = [
  {
    email: 'kepsek@smansa.sch.id',
    username: 'kepsek',
    password: bcrypt.hashSync('Kepsek123!', 12),
    namaLengkap: 'Dr. Ahmad Fauzi, M.Pd',
    noTelp: '081234567890',
    role: 'KEPALA_SEKOLAH' as const,
  },
  {
    email: 'guru.matematika@smansa.sch.id',
    username: 'guru_matematika',
    password: bcrypt.hashSync('Guru123!', 12),
    namaLengkap: 'Siti Aminah, S.Pd',
    noTelp: '081234567891',
    role: 'GURU' as const,
  },
  {
    email: 'guru.bahasa@smansa.sch.id',
    username: 'guru_bahasa',
    password: bcrypt.hashSync('Guru123!', 12),
    namaLengkap: 'Budi Santoso, S.Pd',
    noTelp: '081234567892',
    role: 'GURU' as const,
  },
  {
    email: 'staff.tu@smansa.sch.id',
    username: 'staff_tu',
    password: bcrypt.hashSync('Staff123!', 12),
    namaLengkap: 'Dewi Sartika',
    noTelp: '081234567893',
    role: 'STAFF_TU' as const,
  },
  {
    email: 'siswa1@smansa.sch.id',
    username: 'siswa1',
    password: bcrypt.hashSync('Siswa123!', 12),
    namaLengkap: 'Andi Pratama',
    noTelp: '081234567894',
    role: 'SISWA' as const,
  },
  {
    email: 'siswa2@smansa.sch.id',
    username: 'siswa2',
    password: bcrypt.hashSync('Siswa123!', 12),
    namaLengkap: 'Rina Anggraini',
    noTelp: '081234567895',
    role: 'SISWA' as const,
  },
  {
    email: 'ortu.siswa1@smansa.sch.id',
    username: 'ortu_siswa1',
    password: bcrypt.hashSync('Ortu123!', 12),
    namaLengkap: 'Bapak Pratama',
    noTelp: '081234567896',
    role: 'ORANG_TUA' as const,
  },
  {
    email: 'ortu.siswa2@smansa.sch.id',
    username: 'ortu_siswa2',
    password: bcrypt.hashSync('Ortu123!', 12),
    namaLengkap: 'Ibu Anggraini',
    noTelp: '081234567897',
    role: 'ORANG_TUA' as const,
  },
];