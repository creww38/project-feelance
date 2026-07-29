// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const errors = error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validasi gagal',
        errors,
      });
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: any) {
      const errors = error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validasi query gagal',
        errors,
      });
    }
  };
};