import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      console.warn('WARNING: Missing SMTP_USER or SMTP_PASS environment variables. Email sending will fail.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  async sendForgotPasswordOtp(to: string, otp: string): Promise<void> {
    if (!this.transporter) {
      throw new InternalServerErrorException(
        'Email service is not configured. Missing SMTP_USER or SMTP_PASS.'
      );
    }

    try {
      await this.transporter.sendMail({
        from: `"Event Connect Support" <${process.env.SMTP_USER}>`,
        to,
        subject: '[Event Connect] Mã OTP khôi phục mật khẩu',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e5eb; border-radius: 10px;">
            <h2 style="color: #0B2D4F; text-align: center;">Khôi phục mật khẩu</h2>
            <p>Xin chào,</p>
            <p>Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu cho tài khoản Event Connect của mình.</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #0B2D4F; letter-spacing: 5px; padding: 10px 20px; background-color: #f4f6f9; border-radius: 8px;">
                ${otp}
              </span>
            </div>
            <p>Mã OTP này có hiệu lực trong vòng <strong>10 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
            <hr style="border: 0; border-top: 1px solid #e1e5eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không trả lời thư này.</p>
          </div>
        `,
      });
    } catch (error: any) {
      console.error('Failed to send SMTP email:', error);
      throw new InternalServerErrorException(`Không thể gửi email OTP: ${error.message}`);
    }
  }
}
