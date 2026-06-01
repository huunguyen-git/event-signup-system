import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateEventDto } from './event.dto.js';
import { Event, Prisma } from '../generated/prisma/client.js';
import { createClient } from '@supabase/supabase-js';
import { NotificationService } from '../notification/notification.service.js';

@Injectable()
export class EventService {
  private supabase: ReturnType<typeof createClient>;

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async getEvent(where: Prisma.EventWhereUniqueInput) {
    return this.prisma.event.findUnique({
      where,
      include: {
        host: true,
        _count: {
          select: { applications: true, comments: true },
        },
      },
    });
  }

  async getEvents() {
    return this.prisma.event.findMany({
      include: {
        host: true,
        _count: {
          select: { applications: true, comments: true },
        },
      },
    });
  }

  async getEventByUserId(user_id: string) {
    return this.prisma.event.findMany({
      where: {
        host_id: user_id,
      },
      include: {
        host: true,
        _count: {
          select: { applications: true, comments: true },
        },
      },
      orderBy: {
        event_date: 'desc',
      },
    });
  }

  async createEvent(
    data: CreateEventDto,
    file?: Express.Multer.File,
  ): Promise<Event> {
    const { banner_url, ...restData } = data;
    let imageUrl: string | null = banner_url;
    if (file) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const { error } = await this.supabase.storage
        .from('banner')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (error) throw new Error(error.message);
      const { data: publicUrl } = this.supabase.storage
        .from('banner')
        .getPublicUrl(fileName);
      imageUrl = publicUrl.publicUrl;
    }
    return this.prisma.event.create({
      data: {
        ...restData,
        banner_url: imageUrl,
        event_date: new Date(data.event_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        created_at: new Date(data.created_at),
        max_attendees: Number(data.max_attendees),
        form_config: data.form_config as unknown as Prisma.InputJsonValue,
        status: 'DRAFT' as any,
      },
    });
  }

  async updateEvent(param: {
    where: Prisma.EventWhereUniqueInput;
    data: CreateEventDto;
    file?: Express.Multer.File;
  }): Promise<Event> {
    const { where, data, file } = param;
    const { banner_url, ...restData } = data;
    let finalImageUrl: string | null | undefined = banner_url;
    if (file) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const { error } = await this.supabase.storage
        .from('banner')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (error) throw new Error(error.message);
      const { data: publicUrl } = this.supabase.storage
        .from('banner')
        .getPublicUrl(fileName);
      finalImageUrl = publicUrl.publicUrl;
    }

    return this.prisma.event.update({
      where,
      data: {
        ...restData,
        banner_url: finalImageUrl,
        event_date: new Date(data.event_date),
        end_date: new Date(data.end_date),
        created_at: new Date(data.created_at),
        max_attendees: Number(data.max_attendees),
        form_config: data.form_config as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async deleteEvent(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    return this.prisma.event.delete({ where });
  }

  async cancelEvent(eventId: string, reason: string): Promise<Event> {
    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: { status: 'CANCELLED' as any },
    });

    const applications = await this.prisma.application.findMany({
      where: { event_id: eventId },
      select: { user_id: true }
    });

    for (const app of applications) {
      await this.notificationService.sendAndSaveNotification({
        userId: app.user_id,
        title: `Sự kiện bị huỷ: ${updatedEvent.title}`,
        body: `Lý do: ${reason}`,
      });
    }

    return updatedEvent;
  }

  async submitEventForApproval(eventId: string, hostId: string): Promise<Event> {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, host_id: hostId },
    });

    if (!event) throw new NotFoundException('Không tìm thấy sự kiện.');
    if (event.status !== 'DRAFT') {
      throw new BadRequestException('Chỉ có thể gửi duyệt sự kiện đang ở trạng thái nháp.');
    }

    return await this.prisma.event.update({
      where: { id: eventId },
      data: { status: 'PENDING' as any },
    });
  }

  async approveEvent(eventId: string): Promise<Event> {
    const event = await this.prisma.event.update({
      where: { id: eventId },
      data: { status: 'PUBLISHED' as any },
    });

    await this.notificationService.sendAndSaveNotification({
      userId: event.host_id,
      title: 'Sự kiện đã được duyệt!',
      body: `Sự kiện "${event.title}" của bạn đã được duyệt và chính thức mở đăng ký.`,
    });

    return event;
  }

  async rejectEvent(eventId: string, reason: string): Promise<Event> {
    const event = await this.prisma.event.update({
      where: { id: eventId },
      data: { status: 'REJECTED' as any },
    });

    await this.notificationService.sendAndSaveNotification({
      userId: event.host_id,
      title: 'Sự kiện đã bị từ chối',
      body: `Sự kiện "${event.title}" của bạn không được duyệt. Lý do: ${reason}`,
    });

    return event;
  }
}