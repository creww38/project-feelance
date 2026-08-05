import { Response } from 'express';

export class ResponseHelper {
    static success(res: Response, data: any, message = 'Success', code = 200) {
        return res.status(code).json({ status: 'success', message, data });
    }
    static created(res: Response, data: any, message = 'Created') {
        return this.success(res, data, message, 201);
    }
    static paginated(res: Response, data: any) {
        return res.status(200).json({ status: 'success', data });
    }
    static error(res: Response, message = 'Error', code = 500) {
        return res.status(code).json({ status: 'error', message });
    }
    static badRequest(res: Response, message = 'Bad Request') { return this.error(res, message, 400); }
    static unauthorized(res: Response, message = 'Unauthorized') { return this.error(res, message, 401); }
    static forbidden(res: Response, message = 'Forbidden') { return this.error(res, message, 403); }
    static notFound(res: Response, message = 'Not Found') { return this.error(res, message, 404); }
}