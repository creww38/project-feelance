import { Response } from 'express';

export class ResponseHelper {
  static success(res: Response, data: any, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({ status: 'success', message, data });
  }

  static created(res: Response, data: any, message: string = 'Created') {
    return this.success(res, data, message, 201);
  }

  static error(res: Response, message: string = 'Error', statusCode: number = 500) {
    return res.status(statusCode).json({ status: 'error', message });
  }

  static paginated(res: Response, data: any) {
    return res.status(200).json({ status: 'success', data });
  }

  static notFound(res: Response, message: string = 'Not Found') {
    return this.error(res, message, 404);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static badRequest(res: Response, message: string = 'Bad Request') {
    return this.error(res, message, 400);
  }
}