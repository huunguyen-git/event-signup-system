import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { PrismaService } from '../prisma.service.js';
import { JwtGuard } from '../auth/guards/jwt.guard.js';

@Module({
  providers: [UserService, PrismaService, JwtGuard],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
