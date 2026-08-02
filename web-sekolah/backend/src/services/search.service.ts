// src/services/search.service.ts
import prisma from '../config/database';

export class SearchService {
  async globalSearch(query: string) {
    const [berita, guru, siswa, buku] = await Promise.all([
      prisma.berita.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { judul: { contains: query, mode: 'insensitive' } },
            { konten: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          judul: true,
          slug: true,
          ringkasan: true,
          gambar: true,
          kategori: { select: { nama: true } },
        },
      }),
      prisma.guru.findMany({
        where: {
          user: {
            namaLengkap: { contains: query, mode: 'insensitive' },
          },
        },
        take: 5,
        select: {
          id: true,
          nip: true,
          user: {
            select: { namaLengkap: true, foto: true },
          },
        },
      }),
      prisma.siswa.findMany({
        where: {
          OR: [
            { nis: { contains: query } },
            { user: { namaLengkap: { contains: query, mode: 'insensitive' } } },
          ],
        },
        take: 5,
        select: {
          id: true,
          nis: true,
          user: {
            select: { namaLengkap: true, foto: true },
          },
          kelas: {
            select: { nama: true },
          },
        },
      }),
      prisma.buku.findMany({
        where: {
          OR: [
            { judul: { contains: query, mode: 'insensitive' } },
            { pengarang: { contains: query, mode: 'insensitive' } },
            { kode: { contains: query } },
          ],
        },
        take: 5,
        select: {
          id: true,
          kode: true,
          judul: true,
          pengarang: true,
          cover: true,
        },
      }),
    ]);

    return {
      berita: { items: berita, total: berita.length },
      guru: { items: guru, total: guru.length },
      siswa: { items: siswa, total: siswa.length },
      buku: { items: buku, total: buku.length },
    };
  }

  async searchBerita(query: string) {
    return prisma.berita.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { judul: { contains: query, mode: 'insensitive' } },
          { konten: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        kategori: { select: { nama: true, slug: true } },
        author: { select: { namaLengkap: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });
  }

  async searchGuru(query: string) {
    return prisma.guru.findMany({
      where: {
        user: {
          namaLengkap: { contains: query, mode: 'insensitive' },
        },
      },
      include: {
        user: {
          select: { namaLengkap: true, foto: true, email: true },
        },
        mataPelajaran: {
          select: { nama: true },
        },
      },
      take: 20,
    });
  }

  async searchSiswa(query: string) {
    return prisma.siswa.findMany({
      where: {
        OR: [
          { nis: { contains: query } },
          { user: { namaLengkap: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        user: {
          select: { namaLengkap: true, foto: true },
        },
        kelas: {
          select: { nama: true },
        },
      },
      take: 20,
    });
  }
}