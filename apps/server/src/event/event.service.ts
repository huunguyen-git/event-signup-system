import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateEventDto } from './event.dto.js';
import { Event, Prisma } from '../generated/prisma/client.js';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class EventService {
  private supabase: ReturnType<typeof createClient>;
  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  async getEvent(where: Prisma.EventWhereUniqueInput): Promise<Event | null> {
    return this.prisma.event.findUnique({ where });
  }
  async getEvents(): Promise<Event[]> {
    return this.prisma.event.findMany();
  }
  async createEvent(
    data: CreateEventDto,
    file?: Express.Multer.File,
  ): Promise<Event> {
    let imageUrl: string | null = null;
    const { banner_url, ...restData } = data;
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
      },
    });
  }
  async updateEvent(param: {
    where: Prisma.EventWhereUniqueInput;
    data: CreateEventDto;
  }): Promise<Event> {
    const { where, data } = param;
    return this.prisma.event.update({
      where,
      data: {
        ...data,
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
}
