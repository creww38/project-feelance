import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = file.mimetype.startsWith('image/') ? 'uploads/images/' : 'uploads/documents/';
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${uuid()}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
};

export const uploadSingle = (field: string) => multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).single(field);
export const uploadMultiple = (field: string, max: number = 10) => multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).array(field, max);