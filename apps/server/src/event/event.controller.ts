import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  NotFoundException,
  Body,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EventService } from './event.service.js';
import { CreateEventDto } from './event.dto.js';
import { Event } from '../generated/prisma/client.js';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}
  
  @Get(':id')
  async getEventByID(@Param('id') id: string): Promise<Event> {
    try {
      const event = await this.eventService.getEvent({ id });
      if (!event) {
        throw new Error('Null Event');
      }
      return event;
    } catch {
      throw new NotFoundException(`Not Found Event ID ${id}`);
    }
  }
  
  @Get('user/:user_id')
  async getEventByUserID(
    @Param('user_id') user_id: string,
  ): Promise<Event[] | null> {
    try {
      const events = await this.eventService.getEventByUserId(user_id);
      if (!events) {
        throw Error('Null Event');
      }
      return events;
    } catch {
      throw new NotFoundException(`Not Found Event of UserID ${user_id}`);
    }
  }
  
  @Get()
  async getAllEvent(): Promise<Event[]> {
    return await this.eventService.getEvents();
  }
  
  @Post()
  @UseInterceptors(FileInterceptor('banner_url'))
  async upLoadImage(
    @Body() data: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.eventService.createEvent(data, file);
  }
  
  @Put(':id')
  @UseInterceptors(FileInterceptor('banner_url'))
  async updateEvent(
    @Param('id') id: string,
    @Body() data: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Event> {
    return this.eventService.updateEvent({ where: { id }, data, file });
  }
  
  @Delete(':id')
  async deleteEvent(@Param('id') id: string): Promise<Event> {
    return this.eventService.deleteEvent({ id });
  }

  @Patch(':id/cancel')
  async cancelEvent(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<Event> {
    return this.eventService.cancelEvent(id, reason);
  }

  @Patch(':id/submit')
  async submitEventForApproval(
    @Param('id') id: string,
    @Body('host_id') hostId?: string,
  ): Promise<Event> {
    let currentHostId = hostId;
    if (!currentHostId) {
      const event = await this.eventService.getEvent({ id });
      if (!event) throw new NotFoundException('Không tìm thấy sự kiện');
      currentHostId = event.host_id;
    }
    return this.eventService.submitEventForApproval(id, currentHostId);
  }

  @Patch(':id/approve')
  async approveEvent(@Param('id') id: string): Promise<Event> {
    return this.eventService.approveEvent(id);
  }

  @Patch(':id/reject')
  async rejectEvent(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<Event> {
    return this.eventService.rejectEvent(id, reason || 'Không đủ điều kiện phê duyệt');
  }
}