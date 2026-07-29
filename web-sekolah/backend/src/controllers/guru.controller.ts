// src/controllers/guru.controller.ts
import { Request, Response } from 'express';
import { GuruService } from '../services/guru.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationSchema } from '../validations/common.validation';

const guruService = new GuruService();

export class GuruController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const query = paginationSchema.parse(req.query);
    const filters = {
      search: req.query.search as string,
      statusPegawai: req.query.statusPegawai as string,
      spesialisasi: req.query.spesialisasi as string,
    };

    const result = await guruService.getAll(query, filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const guru = await guruService.getById(id);

    res.status(200).json({
      status: 'success',
      data: { guru },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const guru = await guruService.create(data);

    res.status(201).json({
      status: 'success',
      message: 'Guru berhasil ditambahkan',
      data: { guru },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const guru = await guruService.update(id, data);

    res.status(200).json({
      status: 'success',
      message: 'Data guru berhasil diperbarui',
      data: { guru },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await guruService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Guru berhasil dihapus',
    });
  });

  getJadwal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const jadwal = await guruService.getJadwal(id);

    res.status(200).json({
      status: 'success',
      data: { items: jadwal },
    });
  });

  getWaliKelas = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const kelas = await guruService.getWaliKelas(id);

    res.status(200).json({
      status: 'success',
      data: { kelas },
    });
  });

  getMataPelajaran = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const mataPelajaran = await guruService.getMataPelajaran(id);

    res.status(200).json({
      status: 'success',
      data: { items: mataPelajaran },
    });
  });
}