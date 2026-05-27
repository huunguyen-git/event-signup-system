import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ResponseUserDto } from './dto/response-user.dto.js';
import { Prisma } from '../generated/prisma/client.js';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class UserService {
  private supabase: ReturnType<typeof createClient>;
  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  async create(data: Prisma.UserCreateInput): Promise<ResponseUserDto> {
    const user = await this.prisma.user.create({ data });
    return new ResponseUserDto(user);
  }

  async findById(id: string): Promise<ResponseUserDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new ResponseUserDto(user);
  }

  async findByEmail(email: string): Promise<ResponseUserDto | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new ResponseUserDto(user);
  }

  async update(
    id: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ): Promise<ResponseUserDto> {
    const { avatar_url, ...restDto } = dto;
    await this.findById(id);
    let finalImageUrl: string | null | undefined = avatar_url;
    console.log(dto);
    if (file) {
      const fileExt = file.originalname.split('.').pop()?.toLowerCase() || 'jpeg';
      const fileName = `user-${id}-${Date.now()}.${fileExt}`;

      const { error } = await this.supabase.storage
        .from('banner')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new Error(`Không thể tải ảnh lên: ${error.message}`);
      }

      const { data } = this.supabase.storage
        .from('banner')
        .getPublicUrl(fileName);

      finalImageUrl = data.publicUrl;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...restDto,
        avatar_url: finalImageUrl,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
      },
    });

    return new ResponseUserDto(user);
  }
}
