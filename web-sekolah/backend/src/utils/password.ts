import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash password menggunakan bcrypt
   */
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare password dengan hash
   */
  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate random password
   */
  static generateRandom(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one uppercase, lowercase, number, and special char
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[crypto.randomInt(26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[crypto.randomInt(26)];
    password += '0123456789'[crypto.randomInt(10)];
    password += '!@#$%^&*'[crypto.randomInt(8)];

    // Fill remaining length
    for (let i = password.length; i < length; i++) {
      password += chars[crypto.randomInt(chars.length)];
    }

    // Shuffle
    return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
  }

  /**
   * Generate reset token
   */
  static generateResetToken(): { token: string; expires: Date } {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    return { token, expires };
  }

  /**
   * Validate password strength
   */
  static validateStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password minimal 8 karakter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password harus mengandung huruf besar');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password harus mengandung huruf kecil');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password harus mengandung angka');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password harus mengandung karakter spesial');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default PasswordUtils;