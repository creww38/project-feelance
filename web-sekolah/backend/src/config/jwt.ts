// src/config/jwt.ts
import jwt from 'jsonwebtoken';

export class JwtConfig {
  private static instance: JwtConfig;

  private constructor() {}

  static getInstance(): JwtConfig {
    if (!JwtConfig.instance) {
      JwtConfig.instance = new JwtConfig();
    }
    return JwtConfig.instance;
  }

  generateAccessToken(payload: any): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });
  }

  generateRefreshToken(payload: any): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
  }

  verifyAccessToken(token: string): any {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
  }

  verifyRefreshToken(token: string): any {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  }

  decodeToken(token: string): any {
    return jwt.decode(token);
  }
}