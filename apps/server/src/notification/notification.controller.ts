import { Controller, Post, Get, Body, Param, Put } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { SaveTokenDto, CreateNotificationDto } from './notification.dto.js';
import { Request } from 'express';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Post('save-token/:id')
  async saveToken(@Param('id') id: string, @Body() dto: SaveTokenDto) {
    const userId = id;
    return this.notificationService.savePushToken(userId, dto);
  }

  @Get(':user_id')
  async getMyNotifications(@Param('user_id') user_id: string) {
    return await this.notificationService.getUserNotifications(user_id);
  }

  @Post('send')
  async triggerNotification(@Body() dto: CreateNotificationDto) {
    return await this.notificationService.sendAndSaveNotification(dto);
  }

  @Put(':id')
  async MarkIsRead(@Param('id') id: string) {
    return await this.notificationService.MarkIsRead(id, true);
  }
}
