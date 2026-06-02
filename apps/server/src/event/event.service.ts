import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateEventDto } from './event.dto.js';
import { Event, Prisma } from '../generated/prisma/client.js';
import { createClient } from '@supabase/supabase-js';
import { NotificationService } from '../notification/notification.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';

@Injectable()
export class EventService {
  private supabase: ReturnType<typeof createClient>;

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private realtimeGateway: RealtimeGateway
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
        room: true,
        equipments: {
          include: {
            equipment: true,
          },
        },
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
        room: true,
        equipments: {
          include: {
            equipment: true,
          },
        },
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
        room: true,
        equipments: {
          include: {
            equipment: true,
          },
        },
        _count: {
          select: { applications: true, comments: true },
        },
      },
      orderBy: {
        event_date: 'desc',
      },
    });
  }

  async checkRoomAvailability(
    roomId: string,
    startDate: string,
    endDate: string,
    currentEventId?: string,
  ): Promise<void> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflictingEvent = await this.prisma.event.findFirst({
      where: {
        room_id: roomId,
        status: { notIn: ['CANCELLED', 'DRAFT'] },
        id: currentEventId ? { not: currentEventId } : undefined,
        event_date: { lt: end.toISOString() },
        end_date: { gt: start.toISOString() },
      },
    });

    if (conflictingEvent) {
      // Find all rooms
      const allRooms = await this.prisma.room.findMany();
      // Find booked room IDs in this time slot
      const bookedEvents = await this.prisma.event.findMany({
        where: {
          status: { notIn: ['CANCELLED', 'DRAFT'] },
          id: currentEventId ? { not: currentEventId } : undefined,
          event_date: { lt: end.toISOString() },
          end_date: { gt: start.toISOString() },
        },
        select: {
          room_id: true,
        },
      });

      const bookedRoomIds = new Set(bookedEvents.map((e) => e.room_id).filter(Boolean));
      const availableRooms = allRooms.filter((r) => !bookedRoomIds.has(r.id));
      const suggestions = availableRooms.map((r) => r.name).join(', ');

      throw new BadRequestException(
        `Phòng học đã có người đăng ký trong khung giờ từ ${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${start.toLocaleDateString('vi-VN')} đến ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${end.toLocaleDateString('vi-VN')}. Gợi ý phòng trống: ${suggestions || 'Không có phòng nào trống'}`,
      );
    }
  }

  private parseEquipments(equipmentsStr?: string): { equipment_id: string; quantity: number }[] {
    const parsedEquipments: { equipment_id: string; quantity: number }[] = [];
    if (equipmentsStr) {
      try {
        const parsed = JSON.parse(equipmentsStr);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const eqId = item.equipment_id || item.id || item.equipmentId;
            const qty = Number(item.quantity || 1);
            if (eqId && qty > 0) {
              parsedEquipments.push({ equipment_id: eqId, quantity: qty });
            }
          }
        } else if (typeof parsed === 'object' && parsed !== null) {
          for (const [key, val] of Object.entries(parsed)) {
            const qty = Number(val);
            if (key && qty > 0) {
              parsedEquipments.push({ equipment_id: key, quantity: qty });
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse equipments:', err);
      }
    }
    return parsedEquipments;
  }

  async createEvent(
    data: CreateEventDto,
    file?: Express.Multer.File,
  ): Promise<Event> {
    const host = await this.prisma.user.findUnique({
      where: { id: data.host_id },
    });

    if (host) {
      if (host.role === 'STUDENT') {
        throw new ForbiddenException('Sinh viên không được phép tạo sự kiện.');
      }
    }

    if (data.room_id) {
      await this.checkRoomAvailability(data.room_id, data.event_date, data.end_date);
    }

    const parsedEquipments = this.parseEquipments(data.equipments);

    const { banner_url, equipments, ...restData } = data;
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
    const newEvent = await this.prisma.event.create({
      data: {
        ...restData,
        room_id: data.room_id || null,
        banner_url: imageUrl,
        event_date: new Date(data.event_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        created_at: new Date(data.created_at),
        max_attendees: Number(data.max_attendees),
        form_config: data.form_config as unknown as Prisma.InputJsonValue,
        status: 'DRAFT' as any,
        equipments: parsedEquipments.length > 0 ? {
          createMany: {
            data: parsedEquipments,
          }
        } : undefined,
      },
    });

    this.realtimeGateway.broadcast('events_changed');

    if (host && host.role === 'CLUB') {
      const admins = await this.prisma.user.findMany({
        where: { role: 'FACULTY' },
      });
      for (const admin of admins) {
        await this.notificationService.sendAndSaveNotification({
          userId: admin.id,
          title: `Yêu cầu duyệt sự kiện mới`,
          body: `CLB "${host.full_name}" vừa tạo sự kiện "${newEvent.title}" và đang chờ phê duyệt.`,
        });
      }
    }

    return newEvent;
  }

  async updateEvent(param: {
    where: Prisma.EventWhereUniqueInput;
    data: CreateEventDto;
    file?: Express.Multer.File;
  }): Promise<Event> {
    const { where, data, file } = param;
    const host = await this.prisma.user.findUnique({
      where: { id: data.host_id },
    });

    if (host) {
      if (host.role === 'STUDENT') {
        throw new ForbiddenException('Sinh viên không được phép sửa sự kiện.');
      }
    }

    if (data.room_id) {
      await this.checkRoomAvailability(data.room_id, data.event_date, data.end_date, where.id);
    }

    const parsedEquipments = this.parseEquipments(data.equipments);

    const { banner_url, equipments, ...restData } = data;
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

    const updated = await this.prisma.event.update({
      where,
      data: {
        ...restData,
        room_id: data.room_id || null,
        banner_url: finalImageUrl,
        event_date: new Date(data.event_date),
        end_date: new Date(data.end_date),
        created_at: new Date(data.created_at),
        max_attendees: Number(data.max_attendees),
        form_config: data.form_config as unknown as Prisma.InputJsonValue,
      },
    });

    await this.prisma.eventEquipment.deleteMany({
      where: { event_id: where.id },
    });

    if (parsedEquipments.length > 0) {
      await this.prisma.eventEquipment.createMany({
        data: parsedEquipments.map((pe) => ({
          event_id: where.id!,
          equipment_id: pe.equipment_id,
          quantity: pe.quantity,
        })),
      });
    }

    this.realtimeGateway.broadcast('events_changed');
    return updated;
  }

  async deleteEvent(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    const deleted = await this.prisma.event.delete({ where });
    this.realtimeGateway.broadcast('events_changed');
    return deleted;
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

    this.realtimeGateway.broadcast('events_changed');
    return updatedEvent;
  }

  async approveEvent(eventId: string, approverId: string): Promise<Event> {
    const user = await this.prisma.user.findUnique({
      where: { id: approverId },
    });
    if (!user || user.role !== 'FACULTY') {
      throw new ForbiddenException('Chỉ Cấp Khoa/Đoàn trường mới có quyền duyệt sự kiện');
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'PUBLISHED',
      },
      include: {
        room: true,
      },
    });

    const roomName = updatedEvent.room ? updatedEvent.room.name : 'Chưa xếp phòng';

    await this.notificationService.sendAndSaveNotification({
      userId: updatedEvent.host_id,
      title: `Sự kiện đã được duyệt: ${updatedEvent.title}`,
      body: `Phòng cấp: ${roomName}`,
    });

    // Notify all admins (FACULTY)
    const host = await this.prisma.user.findUnique({ where: { id: updatedEvent.host_id } });
    const hostName = host ? host.full_name : 'CLB';
    const admins = await this.prisma.user.findMany({
      where: { role: 'FACULTY' },
    });
    for (const admin of admins) {
      await this.notificationService.sendAndSaveNotification({
        userId: admin.id,
        title: `Sự kiện đã được duyệt`,
        body: `Sự kiện "${updatedEvent.title}" của CLB "${hostName}" đã được phê duyệt cấp phòng: ${roomName}.`,
      });
    }

    this.realtimeGateway.broadcast('events_changed');
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

  async rejectEvent(eventId: string, approverId: string, reason: string): Promise<Event> {
    const user = await this.prisma.user.findUnique({
      where: { id: approverId },
    });
    if (!user || user.role !== 'FACULTY') {
      throw new ForbiddenException('Chỉ Cấp Khoa/Đoàn trường mới có quyền từ chối sự kiện');
    }

    const event = await this.prisma.event.update({
      where: { id: eventId },
      data: { status: 'REJECTED' as any },
    });

    await this.notificationService.sendAndSaveNotification({
      userId: event.host_id,
      title: 'Sự kiện đã bị từ chối',
      body: `Sự kiện "${event.title}" của bạn không được duyệt. Lý do: ${reason}`,
    });

    this.realtimeGateway.broadcast('events_changed');
    return event;
  }
}