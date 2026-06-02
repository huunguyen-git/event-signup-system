import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { NotificationService } from '../notification/notification.service.js';
import { CreateClubRequestDto } from './dto/create-club-request.dto.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';

@Injectable()
export class ClubRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createRequest(userId: string, dto: CreateClubRequestDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    if (user.role !== 'STUDENT') {
      throw new BadRequestException('Chỉ tài khoản sinh viên mới có thể gửi yêu cầu lên CLB.');
    }

    // Check for pending requests
    const pendingRequest = await this.prisma.clubRequest.findFirst({
      where: { user_id: userId, status: 'PENDING' },
    });

    if (pendingRequest) {
      throw new BadRequestException('Bạn đã có một yêu cầu tham gia CLB đang chờ duyệt.');
    }

    const newRequest = await this.prisma.clubRequest.create({
      data: {
        user_id: userId,
        club_name: dto.club_name,
        description: dto.description,
        status: 'PENDING',
      },
    });
    this.realtimeGateway.broadcast('club_requests_changed');
    return newRequest;
  }

  async getMyRequest(userId: string) {
    return this.prisma.clubRequest.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getRequests(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'FACULTY') {
      throw new ForbiddenException('Chỉ Cấp Khoa/Đoàn trường mới có quyền xem danh sách đăng ký CLB.');
    }

    return this.prisma.clubRequest.findMany({
      include: {
        user: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async approveRequest(requestId: string, approverId: string) {
    const approver = await this.prisma.user.findUnique({ where: { id: approverId } });
    if (!approver || approver.role !== 'FACULTY') {
      throw new ForbiddenException('Chỉ Cấp Khoa/Đoàn trường mới có quyền duyệt yêu cầu.');
    }

    const request = await this.prisma.clubRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Yêu cầu này đã được xử lý.');
    }

    const updatedRequest = await this.prisma.clubRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });

    // Update user role
    await this.prisma.user.update({
      where: { id: request.user_id },
      data: { role: 'CLUB' },
    });

    // Send notification
    await this.notificationService.sendAndSaveNotification({
      userId: request.user_id,
      title: 'Yêu cầu nâng cấp tài khoản thành công',
      body: `Đơn đăng ký CLB "${request.club_name}" của bạn đã được duyệt bởi Nhà trường!`,
    });

    this.realtimeGateway.broadcast('club_requests_changed');
    return updatedRequest;
  }

  async rejectRequest(requestId: string, approverId: string, reason: string) {
    const approver = await this.prisma.user.findUnique({ where: { id: approverId } });
    if (!approver || approver.role !== 'FACULTY') {
      throw new ForbiddenException('Chỉ Cấp Khoa/Đoàn trường mới có quyền từ chối yêu cầu.');
    }

    const request = await this.prisma.clubRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Yêu cầu này đã được xử lý.');
    }

    const updatedRequest = await this.prisma.clubRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    // Send notification
    await this.notificationService.sendAndSaveNotification({
      userId: request.user_id,
      title: 'Yêu cầu nâng cấp tài khoản bị từ chối',
      body: `Đơn đăng ký CLB "${request.club_name}" bị từ chối. Lý do: ${reason}`,
    });

    this.realtimeGateway.broadcast('club_requests_changed');
    return updatedRequest;
  }
}
