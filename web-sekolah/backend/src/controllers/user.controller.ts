// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationSchema } from '../validations/common.validation';
import { createUserSchema, updateUserSchema, updateProfileSchema } from '../validations/user.validation';

const userService = new UserService();

export class UserController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const filters = {
      role: req.query.role as string,
      search: req.query.search as string,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    };

    const result = await userService.getAll(query, filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.getById(id);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = createUserSchema.parse(req.body);
    const user = await userService.create(data);

    res.status(201).json({
      status: 'success',
      message: 'User berhasil dibuat',
      data: { user },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);
    const user = await userService.update(id, data);

    res.status(200).json({
      status: 'success',
      message: 'User berhasil diperbarui',
      data: { user },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await userService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'User berhasil dihapus',
    });
  });

  toggleActive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.toggleActive(id);

    res.status(200).json({
      status: 'success',
      message: `User berhasil ${user.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: { user },
    });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = updateProfileSchema.parse(req.body);
    const user = await userService.updateProfile(userId, data, req.file);

    res.status(200).json({
      status: 'success',
      message: 'Profil berhasil diperbarui',
      data: { user },
    });
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await userService.getById(userId);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;
    await userService.changePassword(userId, oldPassword, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password berhasil diubah',
    });
  });

  getByRole = asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.params;
    const users = await userService.getByRole(role);

    res.status(200).json({
      status: 'success',
      data: { items: users },
    });
  });
}