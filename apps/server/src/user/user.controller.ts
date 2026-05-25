import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { JwtGuard } from '../auth/guards/jwt.guard.js';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar_url'))
  updateMe(
    @Request() req,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.update(req.user.id, dto, file);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
