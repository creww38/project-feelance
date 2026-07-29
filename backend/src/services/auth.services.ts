// backend/src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { JwtUtils } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { EmailService } from './email.service';

export class AuthService {
  private userRepository: UserRepository;
  private jwtUtils: JwtUtils;
  private emailService: EmailService;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtUtils = new JwtUtils();
    this.emailService = new EmailService();
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(data.email);
    
    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials or account disabled', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const accessToken = this.jwtUtils.generateAccessToken({
      id: user.id,
      email: user.email,
      roles: user.userRoles.map(ur => ur.role.nama)
    });

    const refreshToken = this.jwtUtils.generateRefreshToken({ id: user.id });

    // Update last login & refresh token
    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
      refreshToken
    });

    const { password, refreshToken: _, ...userWithoutSensitive } = user;

    return {
      user: userWithoutSensitive,
      accessToken,
      refreshToken
    };
  }

  async register(data: any) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.namaLengkap);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async refreshToken(token: string) {
    const decoded = this.jwtUtils.verifyRefreshToken(token);
    const user = await this.userRepository.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const accessToken = this.jwtUtils.generateAccessToken({
      id: user.id,
      email: user.email,
      roles: user.userRoles.map(ur => ur.role.nama)
    });

    const newRefreshToken = this.jwtUtils.generateRefreshToken({ id: user.id });

    await this.userRepository.update(user.id, {
      refreshToken: newRefreshToken
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, {
      refreshToken: null
    });
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password, refreshToken, ...userWithoutSensitive } = user;
    return userWithoutSensitive;
  }
}