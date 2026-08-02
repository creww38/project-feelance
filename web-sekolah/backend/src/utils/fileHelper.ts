import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { logger } from '../config/logger';

export class FileHelper {
  /**
   * Ensure directory exists
   */
  static ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Get file extension
   */
  static getExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  /**
   * Generate unique filename
   */
  static generateFilename(originalName: string): string {
    const ext = this.getExtension(originalName);
    return `${uuidv4()}${ext}`;
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Resize image
   */
  static async resizeImage(
    inputPath: string,
    outputPath: string,
    width?: number,
    height?: number,
    quality: number = 80
  ): Promise<void> {
    try {
      let transform = sharp(inputPath);
      
      if (width || height) {
        transform = transform.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      await transform
        .jpeg({ quality })
        .png({ quality })
        .toFile(outputPath);

      logger.info(`Image resized: ${outputPath}`);
    } catch (error) {
      logger.error('Failed to resize image:', error);
      throw error;
    }
  }

  /**
   * Generate thumbnail
   */
  static async generateThumbnail(
    inputPath: string,
    outputPath: string,
    size: number = 200
  ): Promise<void> {
    await this.resizeImage(inputPath, outputPath, size, size, 70);
  }

  /**
   * Get image dimensions
   */
  static async getImageDimensions(
    filePath: string
  ): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      logger.error('Failed to get image dimensions:', error);
      return { width: 0, height: 0 };
    }
  }

  /**
   * Delete file
   */
  static deleteFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`File deleted: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to delete file:', error);
      return false;
    }
  }

  /**
   * Clean temp directory
   */
  static cleanTempDirectory(tempDir: string, maxAgeMinutes: number = 60): number {
    let deletedCount = 0;
    
    try {
      if (!fs.existsSync(tempDir)) return 0;

      const files = fs.readdirSync(tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        const ageMinutes = (now - stats.mtimeMs) / (1000 * 60);

        if (ageMinutes > maxAgeMinutes) {
          this.deleteFile(filePath);
          deletedCount++;
        }
      }
    } catch (error) {
      logger.error('Failed to clean temp directory:', error);
    }

    return deletedCount;
  }

  /**
   * Get MIME type from extension
   */
  static getMimeType(filename: string): string {
    const ext = this.getExtension(filename);
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Validate file type
   */
  static isAllowedFileType(filename: string, allowedTypes: string[]): boolean {
    const mimeType = this.getMimeType(filename);
    return allowedTypes.includes(mimeType);
  }
}

export default FileHelper;