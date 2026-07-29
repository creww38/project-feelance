// prisma/seed.ts
import { PrismaClient, RoleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Roles
  const roles = await Promise.all(
    Object.values(RoleType).map(async (roleName) => {
      return prisma.role.upsert({
        where: { nama: roleName },
        update: {},
        create: {
          nama: roleName,
          deskripsi: `Role ${roleName}`,
        },
      });
    })
  );
  console.log(`✅ Created ${roles.length} roles`);

  // Create Permissions
  const permissions = await Promise.all([
    // User Management
    prisma.permission.upsert({
      where: { nama: 'MANAGE_USERS' },
      update: {},
      create: { nama: 'MANAGE_USERS', resource: 'users', action: 'MANAGE' },
    }),
    prisma.permission.upsert({
      where: { nama: 'VIEW_USERS' },
      update: {},
      create: { nama: 'VIEW_USERS', resource: 'users', action: 'READ' },
    }),
    // Berita
    prisma.permission.upsert({
      where: { nama: 'MANAGE_BERITA' },
      update: {},
      create: { nama: 'MANAGE_BERITA', resource: 'berita', action: 'MANAGE' },
    }),
    prisma.permission.upsert({
      where: { nama: 'CREATE_BERITA' },
      update: {},
      create: { nama: 'CREATE_BERITA', resource: 'berita', action: 'CREATE' },
    }),
    // Galeri
    prisma.permission.upsert({
      where: { nama: 'MANAGE_GALERI' },
      update: {},
      create: { nama: 'MANAGE_GALERI', resource: 'galeri', action: 'MANAGE' },
    }),
    // PPDB
    prisma.permission.upsert({
      where: { nama: 'MANAGE_PPDB' },
      update: {},
      create: { nama: 'MANAGE_PPDB', resource: 'ppdb', action: 'MANAGE' },
    }),
    // E-Learning
    prisma.permission.upsert({
      where: { nama: 'MANAGE_ELEARNING' },
      update: {},
      create: { nama: 'MANAGE_ELEARNING', resource: 'elearning', action: 'MANAGE' },
    }),
    // Absensi
    prisma.permission.upsert({
      where: { nama: 'MANAGE_ABSENSI' },
      update: {},
      create: { nama: 'MANAGE_ABSENSI', resource: 'absensi', action: 'MANAGE' },
    }),
  ]);
  console.log(`✅ Created ${permissions.length} permissions`);

  // Assign all permissions to ADMIN role
  const adminRole = roles.find((r) => r.nama === 'ADMIN')!;
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log('✅ Assigned permissions to ADMIN');

  // Create Admin User
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smansa.sch.id' },
    update: {},
    create: {
      email: 'admin@smansa.sch.id',
      username: 'admin',
      password: adminPassword,
      namaLengkap: 'Administrator',
      isActive: true,
      userRoles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });
  console.log(`✅ Created admin user: ${admin.email}`);

  // Create default settings
  const defaultSettings = [
    { key: 'school_name', value: 'SMA Negeri 1', deskripsi: 'Nama Sekolah' },
    { key: 'school_address', value: 'Jl. Pendidikan No. 1', deskripsi: 'Alamat Sekolah' },
    { key: 'school_phone', value: '(021) 1234567', deskripsi: 'Telepon Sekolah' },
    { key: 'school_email', value: 'info@smansa.sch.id', deskripsi: 'Email Sekolah' },
    { key: 'accreditation', value: 'A', deskripsi: 'Akreditasi' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`✅ Created ${defaultSettings.length} settings`);

  // Create sample categories
  const categories = [
    { nama: 'Berita Sekolah', slug: 'berita-sekolah', deskripsi: 'Berita seputar sekolah' },
    { nama: 'Prestasi', slug: 'prestasi', deskripsi: 'Prestasi siswa dan guru' },
    { nama: 'Pengumuman', slug: 'pengumuman', deskripsi: 'Pengumuman penting' },
    { nama: 'Kegiatan', slug: 'kegiatan', deskripsi: 'Kegiatan sekolah' },
  ];

  for (const category of categories) {
    await prisma.kategori.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });