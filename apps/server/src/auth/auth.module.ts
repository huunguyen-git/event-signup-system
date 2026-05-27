import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { JwtGuard } from './guards/jwt.guard.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [UserModule, EmailModule],
  providers: [AuthService, JwtGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtGuard],
})
export class AuthModule {}