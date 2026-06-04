import { Module } from '@nestjs/common';
import { RoomService } from './room.service.js';
import { RoomController } from './room.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  providers: [RoomService, PrismaService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
