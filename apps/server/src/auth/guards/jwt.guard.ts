import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { SupabaseService } from "../../supabase/supabase.service.js";

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(private readonly supabase: SupabaseService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid token');
        }

        const token = authHeader.replace('Bearer ', '');
        const { data, error } = await this.supabase.getClient().auth.getUser(token);

        if (error || !data.user) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        request.user = { id: data.user.id, email: data.user.email };

        return true;
    }
}