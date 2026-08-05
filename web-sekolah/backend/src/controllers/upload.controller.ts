import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
export class UploadController {
    uploadImage = async (req: Request, res: Response) => {
        try {
            if (!req.file) return ResponseHelper.badRequest(res, 'File tidak ditemukan');
            const url = `/uploads/images/${req.file.filename}`;
            return ResponseHelper.success(res, { url, filename: req.file.originalname, size: req.file.size }, 'Upload berhasil');
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    };
}