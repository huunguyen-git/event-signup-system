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

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Sự kiện này chưa được mở đăng ký.');
    }

    if (new Date() >= new Date(event.event_date)) {
      throw new BadRequestException('Sự kiện đã bắt đầu hoặc kết thúc, không thể đăng ký.');
    }

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

    if (event.max_attendees) {
      const approvedCount = await this.prisma.application.count({
        where: { event_id, status: 'APPROVED' },
      });

      if (approvedCount >= event.max_attendees) {
        throw new BadRequestException('Sự kiện đã đủ số lượng người tham gia! Không thể đăng ký thêm.');
      }
    }

    let finalStatus: ApplicationStatus = ApplicationStatus.PENDING;

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
      orderBy: { applied_at: 'asc' },
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
    if (ids.length === 0) return { count: 0 };

    if (status === 'APPROVED') {
      const firstApp = await this.prisma.application.findUnique({
        where: { id: ids[0] },
        select: { event_id: true }
      });

      if (firstApp) {
        const event = await this.prisma.event.findUnique({
          where: { id: firstApp.event_id }
        });

        if (event && event.max_attendees) {
          const currentApprovedCount = await this.prisma.application.count({
            where: { event_id: event.id, status: 'APPROVED' }
          });

          const availableSlots = event.max_attendees - currentApprovedCount;

          if (ids.length > availableSlots) {
            throw new BadRequestException(
              `Chỉ còn ${availableSlots > 0 ? availableSlots : 0} chỗ trống, nhưng bạn đang chọn phê duyệt ${ids.length} người.`
            );
          }
        }
      }
    }

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