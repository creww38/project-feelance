import request from 'supertest';
import app from '../app';
import prisma from '../config/database';

let authToken: string;
let adminUser: any;
let testKategori: any;

beforeAll(async () => {
  // Clean database
  await prisma.berita.deleteMany();
  await prisma.kategori.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  
  adminUser = await prisma.user.create({
    data: {
      email: 'testadmin@test.com',
      username: 'testadmin',
      password: hashedPassword,
      namaLengkap: 'Test Admin',
      isActive: true,
      userRoles: {
        create: {
          role: {
            connect: { nama: 'ADMIN' },
          },
        },
      },
    },
  });

  // Login to get token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'testadmin@test.com', password: 'Admin123!' });
  
  authToken = loginRes.body.data.accessToken;

  // Create test kategori
  testKategori = await prisma.kategori.create({
    data: {
      nama: 'Test Kategori',
      slug: 'test-kategori',
    },
  });
});

afterAll(async () => {
  await prisma.berita.deleteMany();
  await prisma.kategori.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Berita API', () => {
  describe('POST /api/berita', () => {
    it('should create a new berita', async () => {
      const res = await request(app)
        .post('/api/berita')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          judul: 'Test Berita',
          konten: 'Ini adalah konten berita test yang cukup panjang untuk validasi.',
          ringkasan: 'Ringkasan berita test',
          kategoriId: testKategori.id,
          status: 'PUBLISHED',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.berita.judul).toBe('Test Berita');
      expect(res.body.data.berita.slug).toBe('test-berita');
    });

    it('should reject invalid data', async () => {
      const res = await request(app)
        .post('/api/berita')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          judul: 'AB', // Too short
          konten: '',
        });

      expect(res.status).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/berita')
        .send({
          judul: 'Test Berita',
          konten: 'Konten berita',
          kategoriId: testKategori.id,
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/berita', () => {
    it('should return list of berita', async () => {
      const res = await request(app).get('/api/berita');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.items).toBeDefined();
      expect(res.body.data.meta).toBeDefined();
    });

    it('should filter by kategori', async () => {
      const res = await request(app)
        .get(`/api/berita?kategori=${testKategori.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.every(
        (item: any) => item.kategori.slug === testKategori.slug
      )).toBe(true);
    });
  });

  describe('GET /api/berita/:slug', () => {
    it('should return berita by slug', async () => {
      const res = await request(app)
        .get('/api/berita/test-berita');

      expect(res.status).toBe(200);
      expect(res.body.data.berita.judul).toBe('Test Berita');
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await request(app)
        .get('/api/berita/non-existent-slug');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/berita/:id', () => {
    it('should update berita', async () => {
      const berita = await prisma.berita.findFirst({
        where: { slug: 'test-berita' },
      });

      const res = await request(app)
        .put(`/api/berita/${berita!.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          judul: 'Updated Berita',
          konten: 'Updated konten berita',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.berita.judul).toBe('Updated Berita');
    });
  });

  describe('POST /api/berita/:id/like', () => {
    it('should like a berita', async () => {
      const berita = await prisma.berita.findFirst();

      const res = await request(app)
        .post(`/api/berita/${berita!.id}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.liked).toBe(true);
    });

    it('should unlike a berita', async () => {
      const berita = await prisma.berita.findFirst();

      const res = await request(app)
        .post(`/api/berita/${berita!.id}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.liked).toBe(false);
    });
  });

  describe('DELETE /api/berita/:id', () => {
    it('should delete berita', async () => {
      const berita = await prisma.berita.findFirst();

      const res = await request(app)
        .delete(`/api/berita/${berita!.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });
  });
});