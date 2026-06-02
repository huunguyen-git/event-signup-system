import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service.js';
import { ApplicationsController } from './applications.controller.js';
import { PrismaService } from '../prisma.service.js';
import { NotificationService } from '../notification/notification.service.js';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService, PrismaService, NotificationService],
})
export class ApplicationsModule {}