import { Module } from '@nestjs/common';
import { ClubRequestController } from './club-request.controller.js';
import { ClubRequestService } from './club-request.service.js';
import { PrismaService } from '../prisma.service.js';
import { NotificationService } from '../notification/notification.service.js';
import { JwtGuard } from '../auth/guards/jwt.guard.js';

@Module({
  controllers: [ClubRequestController],
  providers: [ClubRequestService, PrismaService, NotificationService, JwtGuard],
  exports: [ClubRequestService],
})
export class ClubRequestModule {}
