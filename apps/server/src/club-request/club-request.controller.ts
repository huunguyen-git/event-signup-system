import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ClubRequestService } from './club-request.service.js';
import { CreateClubRequestDto } from './dto/create-club-request.dto.js';
import { JwtGuard } from '../auth/guards/jwt.guard.js';

@Controller('club-requests')
@UseGuards(JwtGuard)
export class ClubRequestController {
  constructor(private readonly clubRequestService: ClubRequestService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateClubRequestDto) {
    return this.clubRequestService.createRequest(req.user.id, dto);
  }

  @Get('me')
  findMe(@Request() req) {
    return this.clubRequestService.getMyRequest(req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.clubRequestService.getRequests(req.user.id);
  }

  @Patch(':id/approve')
  approve(@Request() req, @Param('id') id: string) {
    return this.clubRequestService.approveRequest(id, req.user.id);
  }

  @Patch(':id/reject')
  reject(@Request() req, @Param('id') id: string, @Body('reason') reason: string) {
    return this.clubRequestService.rejectRequest(id, req.user.id, reason || 'Không có lý do chi tiết');
  }
}
