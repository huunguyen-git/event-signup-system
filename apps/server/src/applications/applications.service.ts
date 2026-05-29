import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { PrismaService } from '../prisma.service.js';
import { ApplicationStatus } from '../generated/prisma/client.js';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

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

    let finalStatus: ApplicationStatus = ApplicationStatus.APPROVED;
    if (event.max_attendees) {
      const currentCount = await this.prisma.application.count({
        where: { event_id, status: { in: ['APPROVED', 'PENDING'] } },
      });
      if (currentCount >= event.max_attendees) finalStatus = ApplicationStatus.WAITLISTED;
    }

    try {
      return await this.prisma.application.create({
        data: { event_id, user_id, answers, status: finalStatus },
      });
    } catch (error: any) {
      if (error.code === 'P2002') throw new BadRequestException('Bạn đã đăng ký rồi!');
      throw error;
    }
  }

  async checkIn(id: string) {
    return this.prisma.application.update({
      where: { id: id },
      data: { checked_in: true },
    });
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
    return this.prisma.application.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: status as ApplicationStatus,
      },
    });
  }
}