import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SeedPermission {
  nama: string;
  resource: string;
  action: string;
}

export const seedPermissions: SeedPermission[] = [
  // User Management
  { nama: 'MANAGE_USERS', resource: 'users', action: 'MANAGE' },
  { nama: 'VIEW_USERS', resource: 'users', action: 'READ' },
  { nama: 'CREATE_USER', resource: 'users', action: 'CREATE' },
  { nama: 'UPDATE_USER', resource: 'users', action: 'UPDATE' },
  { nama: 'DELETE_USER', resource: 'users', action: 'DELETE' },

  // Berita Management
  { nama: 'MANAGE_BERITA', resource: 'berita', action: 'MANAGE' },
  { nama: 'VIEW_BERITA', resource: 'berita', action: 'READ' },
  { nama: 'CREATE_BERITA', resource: 'berita', action: 'CREATE' },
  { nama: 'UPDATE_BERITA', resource: 'berita', action: 'UPDATE' },
  { nama: 'DELETE_BERITA', resource: 'berita', action: 'DELETE' },

  // Galeri Management
  { nama: 'MANAGE_GALERI', resource: 'galeri', action: 'MANAGE' },
  { nama: 'VIEW_GALERI', resource: 'galeri', action: 'READ' },
  { nama: 'CREATE_GALERI', resource: 'galeri', action: 'CREATE' },
  { nama: 'DELETE_GALERI', resource: 'galeri', action: 'DELETE' },

  // Pengumuman Management
  { nama: 'MANAGE_PENGUMUMAN', resource: 'pengumuman', action: 'MANAGE' },
  { nama: 'VIEW_PENGUMUMAN', resource: 'pengumuman', action: 'READ' },
  { nama: 'CREATE_PENGUMUMAN', resource: 'pengumuman', action: 'CREATE' },

  // Agenda Management
  { nama: 'MANAGE_AGENDA', resource: 'agenda', action: 'MANAGE' },
  { nama: 'VIEW_AGENDA', resource: 'agenda', action: 'READ' },
  { nama: 'CREATE_AGENDA', resource: 'agenda', action: 'CREATE' },

  // PPDB Management
  { nama: 'MANAGE_PPDB', resource: 'ppdb', action: 'MANAGE' },
  { nama: 'VIEW_PPDB', resource: 'ppdb', action: 'READ' },
  { nama: 'VERIFY_PPDB', resource: 'ppdb', action: 'UPDATE' },

  // Absensi Management
  { nama: 'MANAGE_ABSENSI', resource: 'absensi', action: 'MANAGE' },
  { nama: 'VIEW_ABSENSI', resource: 'absensi', action: 'READ' },
  { nama: 'RECORD_ABSENSI', resource: 'absensi', action: 'CREATE' },

  // Jadwal Management
  { nama: 'MANAGE_JADWAL', resource: 'jadwal', action: 'MANAGE' },
  { nama: 'VIEW_JADWAL', resource: 'jadwal', action: 'READ' },

  // E-Learning Management
  { nama: 'MANAGE_ELEARNING', resource: 'elearning', action: 'MANAGE' },
  { nama: 'VIEW_ELEARNING', resource: 'elearning', action: 'READ' },
  { nama: 'CREATE_TUGAS', resource: 'elearning', action: 'CREATE' },
  { nama: 'GRADE_TUGAS', resource: 'elearning', action: 'UPDATE' },

  // Nilai Management
  { nama: 'MANAGE_NILAI', resource: 'nilai', action: 'MANAGE' },
  { nama: 'VIEW_NILAI', resource: 'nilai', action: 'READ' },
  { nama: 'INPUT_NILAI', resource: 'nilai', action: 'CREATE' },

  // Perpustakaan Management
  { nama: 'MANAGE_PERPUSTAKAAN', resource: 'perpustakaan', action: 'MANAGE' },
  { nama: 'VIEW_PERPUSTAKAAN', resource: 'perpustakaan', action: 'READ' },
  { nama: 'PINJAM_BUKU', resource: 'perpustakaan', action: 'CREATE' },

  // Alumni Management
  { nama: 'MANAGE_ALUMNI', resource: 'alumni', action: 'MANAGE' },
  { nama: 'VIEW_ALUMNI', resource: 'alumni', action: 'READ' },

  // Settings Management
  { nama: 'MANAGE_SETTINGS', resource: 'settings', action: 'MANAGE' },
  { nama: 'VIEW_SETTINGS', resource: 'settings', action: 'READ' },

  // Dashboard Access
  { nama: 'VIEW_ADMIN_DASHBOARD', resource: 'dashboard_admin', action: 'READ' },
  { nama: 'VIEW_GURU_DASHBOARD', resource: 'dashboard_guru', action: 'READ' },
  { nama: 'VIEW_SISWA_DASHBOARD', resource: 'dashboard_siswa', action: 'READ' },
];

export const rolePermissionMapping: Record<string, string[]> = {
  ADMIN: seedPermissions.map((p) => p.nama),
  KEPALA_SEKOLAH: [
    'VIEW_USERS', 'VIEW_BERITA', 'VIEW_GALERI', 'VIEW_PENGUMUMAN', 'VIEW_AGENDA',
    'VIEW_PPDB', 'VERIFY_PPDB', 'VIEW_ABSENSI', 'VIEW_JADWAL', 'VIEW_ELEARNING',
    'VIEW_NILAI', 'VIEW_PERPUSTAKAAN', 'VIEW_ALUMNI', 'VIEW_SETTINGS',
    'VIEW_ADMIN_DASHBOARD',
  ],
  GURU: [
    'VIEW_BERITA', 'CREATE_BERITA', 'UPDATE_BERITA',
    'VIEW_GALERI', 'CREATE_GALERI',
    'VIEW_PENGUMUMAN', 'CREATE_PENGUMUMAN',
    'VIEW_AGENDA', 'CREATE_AGENDA',
    'VIEW_ABSENSI', 'RECORD_ABSENSI', 'MANAGE_ABSENSI',
    'VIEW_JADWAL', 'MANAGE_JADWAL',
    'VIEW_ELEARNING', 'MANAGE_ELEARNING', 'CREATE_TUGAS', 'GRADE_TUGAS',
    'VIEW_NILAI', 'INPUT_NILAI', 'MANAGE_NILAI',
    'VIEW_PERPUSTAKAAN', 'PINJAM_BUKU',
    'VIEW_ALUMNI',
    'VIEW_GURU_DASHBOARD',
  ],
  STAFF_TU: [
    'VIEW_USERS', 'CREATE_USER', 'UPDATE_USER',
    'VIEW_BERITA', 'CREATE_BERITA',
    'VIEW_GALERI', 'CREATE_GALERI',
    'VIEW_PENGUMUMAN', 'CREATE_PENGUMUMAN',
    'VIEW_AGENDA', 'CREATE_AGENDA',
    'VIEW_PPDB', 'MANAGE_PPDB', 'VERIFY_PPDB',
    'VIEW_ABSENSI', 'RECORD_ABSENSI',
    'VIEW_PERPUSTAKAAN', 'MANAGE_PERPUSTAKAAN',
    'VIEW_SETTINGS',
    'VIEW_ADMIN_DASHBOARD',
  ],
  SISWA: [
    'VIEW_BERITA', 'VIEW_GALERI', 'VIEW_PENGUMUMAN', 'VIEW_AGENDA',
    'VIEW_JADWAL', 'VIEW_ELEARNING', 'VIEW_NILAI',
    'VIEW_PERPUSTAKAAN', 'PINJAM_BUKU',
    'VIEW_SISWA_DASHBOARD',
  ],
  ORANG_TUA: [
    'VIEW_BERITA', 'VIEW_GALERI', 'VIEW_PENGUMUMAN', 'VIEW_AGENDA',
    'VIEW_ABSENSI', 'VIEW_NILAI',
    'VIEW_SISWA_DASHBOARD',
  ],
  GUEST: [
    'VIEW_BERITA', 'VIEW_GALERI', 'VIEW_PENGUMUMAN', 'VIEW_AGENDA',
  ],
};

export async function createSeedPermissions(): Promise<void> {
  console.log('🔑 Creating seed permissions...');

  for (const perm of seedPermissions) {
    await prisma.permission.upsert({
      where: { nama: perm.nama },
      update: {},
      create: {
        nama: perm.nama,
        resource: perm.resource,
        action: perm.action,
      },
    });
  }
  console.log(`  ✅ Created ${seedPermissions.length} permissions`);

  // Assign permissions to roles
  for (const [roleName, permissionNames] of Object.entries(rolePermissionMapping)) {
    const role = await prisma.role.findUnique({
      where: { nama: roleName as any },
    });

    if (!role) continue;

    for (const permName of permissionNames) {
      const permission = await prisma.permission.findUnique({
        where: { nama: permName },
      });

      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
    console.log(`  ✅ Assigned ${permissionNames.length} permissions to ${roleName}`);
  }
}

export default seedPermissions;