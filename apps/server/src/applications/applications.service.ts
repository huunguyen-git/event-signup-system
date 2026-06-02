import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { PrismaService } from '../prisma.service.js';
import { ApplicationStatus } from '../generated/prisma/client.js';
import { NotificationService } from '../notification/notification.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async applyForEvent(dto: CreateApplicationDto) {
    const { event_id, user_id, answers } = dto;

    const event = await this.prisma.event.findUnique({ where: { id: event_id } });
    const user = await this.prisma.user.findUnique({ where: { id: user_id } });

    if (!event || !user)
      throw new BadRequestException('Sự kiện hoặc Người dùng không tồn tại!');

    if (event.allowed_domain) {
      const targetDomain = event.allowed_domain.startsWith('@')
        ? event.allowed_domain.slice(1)
        : event.allowed_domain;
      if (targetDomain.toLowerCase() !== 'all') {
        const emailDomain = user.email.split('@')[1];
        if (emailDomain !== targetDomain) {
          throw new ForbiddenException(`Chỉ dành cho sinh viên có email domain ${event.allowed_domain}`);
        }
      }
    }

    let finalStatus: ApplicationStatus = ApplicationStatus.PENDING;
    if (event.max_attendees) {
      const currentCount = await this.prisma.application.count({
        where: { event_id, status: { in: ['APPROVED', 'PENDING'] } },
      });
      if (currentCount >= event.max_attendees) finalStatus = ApplicationStatus.WAITLISTED;
    }

    try {
      const application = await this.prisma.application.create({
        data: { event_id, user_id, answers, status: finalStatus },
      });

      // Broadcast realtime event
      this.realtimeGateway.broadcast('applications_changed');

      // Notify the event host (CLUB/host)
      await this.notificationService.sendAndSaveNotification({
        userId: event.host_id,
        title: `Đăng ký sự kiện mới`,
        body: `Sinh viên "${user.full_name}" đã đăng ký tham gia sự kiện "${event.title}".`,
      });

      // Notify all admins (FACULTY)
      const host = await this.prisma.user.findUnique({ where: { id: event.host_id } });
      const hostName = host ? host.full_name : 'CLB';
      const admins = await this.prisma.user.findMany({
        where: { role: 'FACULTY' },
      });
      for (const admin of admins) {
        await this.notificationService.sendAndSaveNotification({
          userId: admin.id,
          title: `Đăng ký sự kiện mới (Admin)`,
          body: `Sinh viên "${user.full_name}" đã đăng ký tham gia sự kiện "${event.title}" do CLB "${hostName}" tổ chức.`,
        });
      }

      return application;
    } catch (error: any) {
      if (error.code === 'P2002') throw new BadRequestException('Bạn đã đăng ký rồi!');
      throw error;
    }
  }

  async checkIn(id: string) {
    const updated = await this.prisma.application.update({
      where: { id: id },
      data: { checked_in: true },
    });
    this.realtimeGateway.broadcast('applications_changed');
    return updated;
  }

  async getByEvent(event_id: string) {
    return this.prisma.application.findMany({
      where: { event_id },
      include: { user: { select: { full_name: true, email: true, avatar_url: true } } },
      orderBy: { applied_at: 'desc' },
    });
  }

  async getByUser(userId: string) {
    return this.prisma.application.findMany({
      where: { user_id: userId },
      include: {
        event: true,
      },
      orderBy: { applied_at: 'desc' },
    });
  }

  async bulkUpdateStatus(ids: string[], status: string) {
    // 1. Fetch details of applications to notify users
    const apps = await this.prisma.application.findMany({
      where: { id: { in: ids } },
      include: { event: true },
    });

    // 2. Perform update
    const result = await this.prisma.application.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: status as ApplicationStatus,
      },
    });

    // 3. Broadcast real-time change
    this.realtimeGateway.broadcast('applications_changed');

    // 4. Send custom notifications to each student
    for (const app of apps) {
      let bodyText = '';
      if (status === 'APPROVED') {
        bodyText = `Đơn đăng ký tham gia sự kiện "${app.event.title}" của bạn đã được duyệt!`;
      } else if (status === 'REJECTED') {
        bodyText = `Đơn đăng ký tham gia sự kiện "${app.event.title}" của bạn đã bị từ chối.`;
      } else if (status === 'WAITLISTED') {
        bodyText = `Bạn đã được đưa vào danh sách chờ của sự kiện "${app.event.title}".`;
      } else {
        bodyText = `Đơn đăng ký tham gia sự kiện "${app.event.title}" của bạn đã được cập nhật thành: ${status}.`;
      }

      await this.notificationService.sendAndSaveNotification({
        userId: app.user_id,
        title: `Kết quả đăng ký sự kiện: ${app.event.title}`,
        body: bodyText,
      });
    }

    return result;
  }
}