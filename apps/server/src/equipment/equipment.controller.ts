import { Controller, Get } from '@nestjs/common';
import { EquipmentService } from './equipment.service.js';

@Controller('equipments')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async getEquipments() {
    return this.equipmentService.getEquipments();
  }
}
