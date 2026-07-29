// src/middlewares/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/AppError';

// Local storage configuration
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';

    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else {
      uploadPath += 'documents/';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedImages = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocs = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  const allowedVideos = ['video/mp4', 'video/webm'];

  const allAllowed = [...allowedImages, ...allowedDocs, ...allowedVideos];

  if (allAllowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Tipe file ${file.mimetype} tidak diizinkan`, 400), false);
  }
};

// Upload instances
export const uploadSingle = (fieldName: string) =>
  multer({
    storage: localStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }).single(fieldName);

export const uploadMultiple = (fieldName: string, maxCount: number = 10) =>
  multer({
    storage: localStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).array(fieldName, maxCount);

export const uploadFields = (fields: multer.Field[]) =>
  multer({
    storage: localStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).fields(fields);