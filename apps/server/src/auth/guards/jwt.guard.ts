import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service.js';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('JwtGuard triggered');
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    console.log('authHeader:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const token = authHeader.replace('Bearer ', '');

    console.log('calling supabase...');
    try {
      const result = await Promise.race([
        this.supabase.getClient().auth.getUser(token),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 5000),
        ),
      ]);
      console.log('result:', result);
    } catch (err) {
      console.log('caught error:', err);
    }

    const { data, error } = await this.supabase.getClient().auth.getUser(token);
    console.log('data:', data);
    console.log('error:', error);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = { id: data.user.id, email: data.user.email };

    return true;
  }
}
