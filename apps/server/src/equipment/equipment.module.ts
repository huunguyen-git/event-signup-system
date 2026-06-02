import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service.js';
import { EquipmentController } from './equipment.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  providers: [EquipmentService, PrismaService],
  controllers: [EquipmentController],
  exports: [EquipmentService],
})
export class EquipmentModule {}
