import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateNotificationDto, SaveTokenDto } from './notification.dto.js';
import { Expo } from 'expo-server-sdk';

@Injectable()
export class NotificationService {
  private expo = new Expo();

  constructor(private prisma: PrismaService) {}

  async savePushToken(userId: string, tok: SaveTokenDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { token: tok.token },
    });
  }

  async getUserNotifications(userId: string) {
    try {
      return await this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      console.log(err);
    }
  }

  async sendAndSaveNotification(dto: CreateNotificationDto) {
    const { userId, title, body } = dto;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const notification = await this.prisma.notification.create({
      data: { userId, title, body },
    });
    try {
      if (user?.token && Expo.isExpoPushToken(user.token)) {
        await this.expo.sendPushNotificationsAsync([
          {
            to: user.token,
            sound: 'default',
            title,
            body,
            data: { notificationId: notification.id },
          },
        ]);
      }
      return notification;
    } catch (error) {
      console.error(error);
    }
  }
  async MarkIsRead(id: string, isRead: boolean) {
    return await this.prisma.notification.update({
      where: { id },
      data: { isRead },
    });
  }
}
