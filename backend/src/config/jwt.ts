// src/config/jwt.ts
import jwt from 'jsonwebtoken';
import { logger } from './logger';

export class JwtConfig {
  private static instance: JwtConfig;
  
  public readonly accessSecret: string;
  public readonly refreshSecret: string;
  public readonly accessExpiresIn: string;
  public readonly refreshExpiresIn: string;

  private constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET || 'access-secret-change-me';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me';
    this.accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  public static getInstance(): JwtConfig {
    if (!JwtConfig.instance) {
      JwtConfig.instance = new JwtConfig();
    }
    return JwtConfig.instance;
  }

  public generateAccessToken(payload: Record<string, any>): string {
    try {
      return jwt.sign(payload, this.accessSecret, {
        expiresIn: this.accessExpiresIn,
      });
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw error;
    }
  }

  public generateRefreshToken(payload: Record<string, any>): string {
    try {
      return jwt.sign(payload, this.refreshSecret, {
        expiresIn: this.refreshExpiresIn,
      });
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw error;
    }
  }

  public verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.accessSecret);
    } catch (error) {
      logger.error('Error verifying access token:', error);
      throw error;
    }
  }

  public verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (error) {
      logger.error('Error verifying refresh token:', error);
      throw error;
    }
  }

  public decodeToken(token: string): any {
    return jwt.decode(token);
  }
}

export default JwtConfig.getInstance();