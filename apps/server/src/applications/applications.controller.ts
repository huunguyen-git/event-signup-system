import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { ApplicationsService } from './applications.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';

@Controller() 
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('applications')
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.applyForEvent(dto);
  }

  @Patch('applications/bulk-update-status')
  bulkUpdateStatus(@Body() body: { ids: string[], status: string }) {
    return this.applicationsService.bulkUpdateStatus(body.ids, body.status);
  }

  @Patch('applications/:id/check-in')
  checkIn(@Param('id') id: string) {
    return this.applicationsService.checkIn(id);
  }

  @Get('events/:id/applications')
  findAll(@Param('id') id: string) {
    return this.applicationsService.getByEvent(id);
  }

  @Get('applications/user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.applicationsService.getByUser(userId);
  }
}