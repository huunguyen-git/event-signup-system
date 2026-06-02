import { Controller, Get } from '@nestjs/common';
import { RoomService } from './room.service.js';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getRooms() {
    return this.roomService.getRooms();
  }
}
