import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { UserService } from '../user/user.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { EmailService } from '../email/email.service.js';

@Injectable()
export class AuthService {
  private otpCache = new Map<string, { otp: string; expires: number }>();

  constructor(
    private readonly supabase: SupabaseService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const client = this.supabase.getClient();

    const { data: authData, error: authError } = await client.auth.signUp({
      email: dto.email,
      password: dto.password,
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('User already exists')) {
        throw new ConflictException('Email is already in use');
      }
      if (authError.message.includes('confirmation email') || authError.message.includes('SMTP')) {
        throw new InternalServerErrorException(
          `Gửi email xác thực thất bại: ${authError.message}. Vui lòng kiểm tra lại cấu hình SMTP (Host, Port, hoặc Mật khẩu ứng dụng Gmail) trong Supabase Dashboard.`
        );
      }
      throw new InternalServerErrorException(authError.message);
    }

    if (!authData.user) {
      throw new InternalServerErrorException('Failed to create user auth session');
    }

    const user = await this.userService.create({
      id: authData.user.id,
      email: dto.email,
      full_name: dto.full_name,
      birthdate: new Date(dto.birthdate),
      phone_number: dto.phone_number,
    });

    return user;
  }

  async login(dto: LoginDto) {
    const client = this.supabase.getClient();

    const { data, error } = await client.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new UnauthorizedException('Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư để kích hoạt tài khoản.');
      }
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: await this.userService.findById(data.user.id),
    };
  }

  async logout(accessToken: string) {
    const client = this.supabase.getClient();

    const { error } = await client.auth.admin.signOut(accessToken);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản với email này');
    }

    // Generate a 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Save to local memory cache
    this.otpCache.set(dto.email.toLowerCase(), { otp, expires });

    // Send the email using the local EmailService (Gmail SMTP)
    await this.emailService.sendForgotPasswordOtp(dto.email, otp);

    // Also print to console for local testing convenience
    console.log(`\n==================================================`);
    console.log(`[OTP RECOVERY] Email: ${dto.email}`);
    console.log(`[OTP RECOVERY] OTP Code: ${otp}`);
    console.log(`[OTP RECOVERY] Expiry: 10 minutes`);
    console.log(`==================================================\n`);

    return { message: 'Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const emailKey = dto.email.toLowerCase();
    const cached = this.otpCache.get(emailKey);

    if (!cached) {
      throw new BadRequestException('Yêu cầu mã OTP không tồn tại hoặc đã hết hạn');
    }

    if (cached.expires < Date.now()) {
      this.otpCache.delete(emailKey);
      throw new BadRequestException('Mã OTP đã hết hạn');
    }

    if (cached.otp !== dto.otp) {
      throw new BadRequestException('Mã OTP không chính xác');
    }

    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản với email này');
    }

    const client = this.supabase.getClient();
    const { error: updateError } = await client.auth.admin.updateUserById(user.id, {
      password: dto.newPassword,
    });

    if (updateError) {
      throw new InternalServerErrorException(updateError.message);
    }

    // Clean up the verified OTP
    this.otpCache.delete(emailKey);

    return { message: 'Mật khẩu của bạn đã được đặt lại thành công' };
  }


  async changePassword(userId: string, email: string, dto: ChangePasswordDto) {
    const client = this.supabase.getClient();

    const { error: authError } = await client.auth.signInWithPassword({
      email,
      password: dto.oldPassword,
    });

    if (authError) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }

    const { error: updateError } = await client.auth.admin.updateUserById(userId, {
      password: dto.newPassword,
    });

    if (updateError) {
      throw new InternalServerErrorException(updateError.message);
    }

    return { message: 'Mật khẩu đã được đổi thành công' };
  }
}
