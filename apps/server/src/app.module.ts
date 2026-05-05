import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventService } from './event/event.service.js';
import { EventController } from './event/event.controller.js';
import { PrismaService } from './prisma.service.js';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [EventController],
  providers: [EventService, PrismaService],
})
export class AppModule {}
