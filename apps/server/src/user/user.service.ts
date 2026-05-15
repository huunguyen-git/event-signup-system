import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ResponseUserDto } from './dto/response-user.dto.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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

  async update(id: string, dto: UpdateProfileDto): Promise<ResponseUserDto> {
    await this.findById(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
      },
    });

    return new ResponseUserDto(user);
  }
}
