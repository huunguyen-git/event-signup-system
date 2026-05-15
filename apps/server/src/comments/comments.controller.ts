import { Controller, Post, Body, Patch, Param, Get, Query } from '@nestjs/common';
import { CommentsService } from './comments.service.js';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('comments')
  create(@Body() dto: any) {
    return this.commentsService.create(dto);
  }

  @Get('events/:id/comments')
  findAll(@Param('id') id: string) {
    return this.commentsService.findByEvent(id);
  }

  @Patch('comments/:id/pin')
  pin(@Param('id') id: string, @Query('user_id') user_id: string) {
    return this.commentsService.pin(id, user_id);
  }
}