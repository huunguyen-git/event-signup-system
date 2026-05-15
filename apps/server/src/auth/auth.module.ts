import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';

@Module({
  providers: [AuthService],
  imports: [UserModule],
  controllers: [AuthController],
})
export class AuthModule {}
