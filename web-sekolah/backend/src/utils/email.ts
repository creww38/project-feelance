import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
  cc?: string | string[];
  bcc?: string | string[];
}

export class EmailUtils {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Get or create email transporter
   */
  static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  /**
   * Send email
   */
  static async send(options: EmailOptions): Promise<boolean> {
    try {
      const transporter = this.getTransporter();

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Sekolah'}" <${process.env.SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
        cc: options.cc,
        bcc: options.bcc,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send bulk emails
   */
  static async sendBulk(
    recipients: Array<{ email: string; name?: string }>,
    subject: string,
    htmlTemplate: (name?: string) => string
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const html = htmlTemplate(recipient.name);
      const sent = await this.send({
        to: recipient.email,
        subject,
        html,
      });

      if (sent) success++;
      else failed++;
    }

    return { success, failed };
  }

  /**
   * Verify SMTP connection
   */
  static async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      logger.info('SMTP connection verified');
      return true;
    } catch (error) {
      logger.error('SMTP connection failed:', error);
      return false;
    }
  }
}

export default EmailUtils;