import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async getRooms() {
    return this.prisma.room.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
