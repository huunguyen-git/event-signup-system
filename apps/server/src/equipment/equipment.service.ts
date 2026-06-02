import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async getEquipments() {
    return this.prisma.equipment.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
