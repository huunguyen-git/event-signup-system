import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    await this.seedRoomsAndEquipments();
  }

  private async seedRoomsAndEquipments() {
    try {
      const roomsCount = await this.room.count();
      if (roomsCount === 0) {
        await this.room.createMany({
          data: [
            { name: 'Giảng đường 1', capacity: 150 },
            { name: 'Giảng đường 2', capacity: 120 },
            { name: 'Hội trường', capacity: 300 },
            { name: 'Phòng Seminar', capacity: 50 },
          ],
        });
        console.log('Seeded rooms successfully.');
      }

      const equipmentsCount = await this.equipment.count();
      if (equipmentsCount === 0) {
        await this.equipment.createMany({
          data: [
            { name: 'Máy chiếu', quantity: 10 },
            { name: 'Micro', quantity: 20 },
            { name: 'Loa', quantity: 5 },
          ],
        });
        console.log('Seeded equipments successfully.');
      }
    } catch (err) {
      console.log('Error seeding database rooms and equipments:', err);
    }
  }
}
