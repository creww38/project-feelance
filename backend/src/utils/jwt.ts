// backend/src/utils/jwt.ts
import jwt from 'jsonwebtoken';

export class JwtUtils {
  private accessSecret: string;
  private refreshSecret: string;

  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET || 'access-secret';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
  }

  generateAccessToken(payload: object): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: '15m'
    });
  }

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: '7d'
    });
  }

  verifyAccessToken(token: string): any {
    return jwt.verify(token, this.accessSecret);
  }

  verifyRefreshToken(token: string): any {
    return jwt.verify(token, this.refreshSecret);
  }
}