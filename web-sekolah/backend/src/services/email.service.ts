// src/services/email.service.ts
import { sendEmail } from '../config/email';

export class EmailService {
  async sendWelcomeEmail(to: string, nama: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Selamat Datang! 🎉</h1>
          </div>
          <div class="content">
            <h2>Halo, ${nama}!</h2>
            <p>Akun Anda telah berhasil dibuat di Sistem Informasi Sekolah.</p>
            <p>Anda dapat login menggunakan email dan password yang telah didaftarkan.</p>
            <a href="${process.env.FRONTEND_URL}/login" class="button">Login Sekarang</a>
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Email ini dikirim secara otomatis, mohon tidak membalas.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to,
      subject: 'Selamat Datang di Sistem Informasi Sekolah',
      html,
    });
  }

  async sendPasswordResetEmail(to: string, nama: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Password 🔐</h1>
          </div>
          <div class="content">
            <h2>Halo, ${nama}!</h2>
            <p>Kami menerima permintaan reset password untuk akun Anda.</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <div class="warning">
              <strong>⚠️ Perhatian:</strong> Link ini hanya berlaku selama 1 jam.
              Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to,
      subject: 'Reset Password - Sistem Informasi Sekolah',
      html,
    });
  }

  async sendPasswordChangedEmail(to: string, nama: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Berhasil Diubah ✅</h1>
          </div>
          <div class="content">
            <h2>Halo, ${nama}!</h2>
            <p>Password akun Anda telah berhasil diubah.</p>
            <p>Jika Anda tidak melakukan perubahan ini, segera hubungi administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to,
      subject: 'Password Berhasil Diubah - Sistem Informasi Sekolah',
      html,
    });
  }

  async sendPPDBStatusEmail(to: string, nama: string, status: string) {
    const statusColors: any = {
      ACCEPTED: { color: '#10b981', text: 'Selamat! Anda Diterima 🎉' },
      REJECTED: { color: '#ef4444', text: 'Mohon Maaf 😔' },
      VERIFIED: { color: '#3b82f6', text: 'Berkas Terverifikasi ✅' },
    };

    const statusInfo = statusColors[status] || { color: '#6b7280', text: 'Status Diperbarui' };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusInfo.color}; color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusInfo.text}</h1>
          </div>
          <div class="content">
            <h2>Halo, ${nama}!</h2>
            <p>Status PPDB Anda telah diperbarui menjadi: <strong>${status}</strong></p>
            <p>Silakan login untuk melihat detail lebih lanjut.</p>
            <a href="${process.env.FRONTEND_URL}/ppdb/status" class="button" style="display: inline-block; background: ${statusInfo.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; margin: 20px 0;">Cek Status</a>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to,
      subject: `Status PPDB - ${status}`,
      html,
    });
  }
}