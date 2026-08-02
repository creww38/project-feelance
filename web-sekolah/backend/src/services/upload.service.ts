import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { FileHelper } from '../utils/fileHelper';
import path from 'path';
import fs from 'fs';

export class UploadService {
  async uploadImage(file: Express.Multer.File, folder: string = 'images') {
    // Generate thumbnail
    const thumbnailPath = path.join(
      path.dirname(file.path),
      `thumb_${file.filename}`
    );

    await FileHelper.generateThumbnail(file.path, thumbnailPath, 300);

    // Upload to cloudinary if configured
    let cloudinaryResult = null;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      cloudinaryResult = await uploadToCloudinary(file.path, folder);
    }

    const dimensions = await FileHelper.getImageDimensions(file.path);

    return {
      original: `/uploads/${folder}/${file.filename}`,
      thumbnail: `/uploads/${folder}/thumb_${file.filename}`,
      cloudinary: cloudinaryResult?.secure_url,
      dimensions,
      size: FileHelper.formatFileSize(file.size),
      mimeType: file.mimetype,
    };
  }

  async uploadDocument(file: Express.Multer.File) {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(file.path, 'documents');
      return {
        url: result.secure_url,
        filename: file.originalname,
        size: FileHelper.formatFileSize(file.size),
        mimeType: file.mimetype,
      };
    }

    return {
      url: `/uploads/documents/${file.filename}`,
      filename: file.originalname,
      size: FileHelper.formatFileSize(file.size),
      mimeType: file.mimetype,
    };
  }

  async uploadMultiple(files: Express.Multer.File[], folder: string = 'images') {
    const results = [];
    for (const file of files) {
      if (file.mimetype.startsWith('image/')) {
        results.push(await this.uploadImage(file, folder));
      } else {
        results.push(await this.uploadDocument(file));
      }
    }
    return results;
  }

  async uploadAvatar(file: Express.Multer.File) {
    // Resize to avatar size
    const avatarPath = path.join(
      path.dirname(file.path),
      `avatar_${file.filename}`
    );

    await FileHelper.resizeImage(file.path, avatarPath, 200, 200, 80);

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(avatarPath, 'avatars');
      return { url: result.secure_url };
    }

    return { url: `/uploads/avatars/avatar_${file.filename}` };
  }

  async deleteFile(filePath: string) {
    const fullPath = path.join(process.cwd(), filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return { message: 'File berhasil dihapus' };
  }
}