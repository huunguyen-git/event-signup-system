import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.comment.create({
      data: dto,
      include: {
        user: { select: { id: true, full_name: true, avatar_url: true } }
      }
    });
  }

  async findByEvent(event_id: string) {
    return this.prisma.comment.findMany({
      where: { event_id },
      include: {
        user: { select: { id: true, full_name: true, avatar_url: true } },
      },
      orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }]
    });
  }

  async pin(id: string, user_id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { event: true }
    });
    if (!comment) throw new BadRequestException('Không tìm thấy!');
    if (comment.event.host_id !== user_id) throw new ForbiddenException('Chỉ Host mới có quyền ghim!');

    return this.prisma.comment.update({
      where: { id },
      data: { is_pinned: !comment.is_pinned }
    });
  }
}