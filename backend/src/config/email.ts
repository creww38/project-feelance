// src/config/email.ts
import nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"${process.env.SCHOOL_NAME || 'Sekolah'}" <${process.env.SMTP_USER}>`,
      ...options,
    });
    logger.info(`Email sent to ${options.to}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};