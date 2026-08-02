import { PrismaClient, RoleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface SeedUser {
  email: string;
  username: string;
  password: string;
  namaLengkap: string;
  role: RoleType;
  isActive: boolean;
}

export const seedUsers: SeedUser[] = [
  {
    email: 'admin@smansa.sch.id',
    username: 'admin',
    password: 'Admin123!',
    namaLengkap: 'Administrator Utama',
    role: 'ADMIN',
    isActive: true,
  },
  {
    email: 'kepsek@smansa.sch.id',
    username: 'kepsek',
    password: 'Kepsek123!',
    namaLengkap: 'Dr. H. Ahmad Fauzi, M.Pd',
    role: 'KEPALA_SEKOLAH',
    isActive: true,
  },
  {
    email: 'guru.matematika@smansa.sch.id',
    username: 'guru_matematika',
    password: 'Guru123!',
    namaLengkap: 'Dra. Siti Nurhaliza, M.Si',
    role: 'GURU',
    isActive: true,
  },
  {
    email: 'guru.bahasa@smansa.sch.id',
    username: 'guru_bahasa',
    password: 'Guru123!',
    namaLengkap: 'Drs. Budi Santoso, M.Pd',
    role: 'GURU',
    isActive: true,
  },
  {
    email: 'staff@smansa.sch.id',
    username: 'staff_tu',
    password: 'Staff123!',
    namaLengkap: 'Rina Anggraeni, S.Kom',
    role: 'STAFF_TU',
    isActive: true,
  },
  {
    email: 'siswa.contoh@smansa.sch.id',
    username: 'siswa_contoh',
    password: 'Siswa123!',
    namaLengkap: 'Andi Pratama',
    role: 'SISWA',
    isActive: true,
  },
  {
    email: 'orangtua.contoh@smansa.sch.id',
    username: 'orangtua_contoh',
    password: 'Ortu123!',
    namaLengkap: 'Bapak Supriyadi',
    role: 'ORANG_TUA',
    isActive: true,
  },
];

export async function createSeedUsers(): Promise<void> {
  console.log('📝 Creating seed users...');

  for (const userData of seedUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      // Find or create the role
      const role = await prisma.role.findUnique({
        where: { nama: userData.role },
      });

      if (role) {
        await prisma.user.create({
          data: {
            email: userData.email,
            username: userData.username,
            password: hashedPassword,
            namaLengkap: userData.namaLengkap,
            isActive: userData.isActive,
            userRoles: {
              create: {
                roleId: role.id,
              },
            },
          },
        });
        console.log(`  ✅ Created user: ${userData.email} (${userData.role})`);
      }
    } else {
      console.log(`  ⏭️  User already exists: ${userData.email}`);
    }
  }
}

export default seedUsers;