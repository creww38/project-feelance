// src/services/galeri.service.ts
import { GaleriRepository } from '../repositories/galeri.repository';
import { AppError } from '../utils/AppError';
import { uploadToCloudinary } from '../config/cloudinary';
import { generateSlug } from '../utils/slug';
import fs from 'fs/promises';

const galeriRepository = new GaleriRepository();

export class GaleriService {
  async getAllAlbums(options: any) {
    return galeriRepository.findAllAlbums(options);
  }

  async getAlbumById(id: string) {
    const album = await galeriRepository.findAlbumById(id);
    if (!album) throw new AppError('Album tidak ditemukan', 404);
    return album;
  }

  async createAlbum(data: any, file?: Express.Multer.File) {
    const slug = generateSlug(data.nama);
    let cover = null;

    if (file) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(file.path, 'albums');
        cover = result.secure_url;
        await fs.unlink(file.path);
      } else {
        cover = `/uploads/images/${file.filename}`;
      }
    }

    return galeriRepository.createAlbum({
      ...data,
      slug,
      cover,
    });
  }

  async updateAlbum(id: string, data: any, file?: Express.Multer.File) {
    const album = await galeriRepository.findAlbumById(id);
    if (!album) throw new AppError('Album tidak ditemukan', 404);

    const updateData: any = { ...data };
    if (data.nama) updateData.slug = generateSlug(data.nama);

    if (file) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(file.path, 'albums');
        updateData.cover = result.secure_url;
        await fs.unlink(file.path);
      } else {
        updateData.cover = `/uploads/images/${file.filename}`;
      }
    }

    return galeriRepository.updateAlbum(id, updateData);
  }

  async deleteAlbum(id: string) {
    const album = await galeriRepository.findAlbumById(id);
    if (!album) throw new AppError('Album tidak ditemukan', 404);
    await galeriRepository.deleteAlbum(id);
  }

  async getItems(albumId: string, options: any) {
    return galeriRepository.findItems(albumId, options);
  }

  async uploadItems(albumId: string, files: Express.Multer.File[], userId: string) {
    const album = await galeriRepository.findAlbumById(albumId);
    if (!album) throw new AppError('Album tidak ditemukan', 404);

    const items = [];
    for (const file of files) {
      let url = '';
      let thumbnail = '';

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(file.path, `gallery/${albumId}`);
        url = result.secure_url;
        thumbnail = result.secure_url;
        await fs.unlink(file.path);
      } else {
        url = `/uploads/images/${file.filename}`;
        thumbnail = url;
      }

      const item = await galeriRepository.createItem({
        judul: file.originalname.split('.')[0],
        tipe: file.mimetype.startsWith('video/') ? 'VIDEO' : 'FOTO',
        url,
        thumbnail,
        albumId,
        uploadedBy: userId,
        ukuran: file.size,
      });

      items.push(item);
    }

    return items;
  }

  async deleteItem(id: string) {
    const item = await galeriRepository.findItemById(id);
    if (!item) throw new AppError('Item tidak ditemukan', 404);
    await galeriRepository.deleteItem(id);
  }
}