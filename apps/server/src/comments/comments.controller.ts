import { Controller, Post, Body, Patch, Param, Get, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service.js';
import { JwtGuard } from '../auth/guards/jwt.guard.js';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Req() req, @Body() dto: any) {
    dto.user_id = req.user.id;
    return this.commentsService.create(dto);
  }

  @Get('event/:id')
  findAll(@Param('id') id: string) {
    return this.commentsService.findByEvent(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/pin')
  pin(@Req() req, @Param('id') id: string) {
    return this.commentsService.pin(id, req.user.id);
  }
}