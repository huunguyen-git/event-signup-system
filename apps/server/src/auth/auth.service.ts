import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { UserService } from '../user/user.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly userService: UserService,
  ) {}

  async register(dto: RegisterDto) {
    const client = this.supabase.getClient();

    const { data: authData, error: authError } =
      await client.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true, // disable email confirmation
      });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new ConflictException('Email is already in use');
      }
      throw new InternalServerErrorException(authError.message);
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
      throw new UnauthorizedException('Invalid email or password');
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
}
