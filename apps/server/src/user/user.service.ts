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

  async update(
    id: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ): Promise<ResponseUserDto> {
    const { avatar_url, ...restDto } = dto;
    await this.findById(id);
    let finalImageUrl: string | null | undefined = avatar_url;
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
    console.log(file);
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
