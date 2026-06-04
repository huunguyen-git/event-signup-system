import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventService } from './event/event.service.js';
import { EventController } from './event/event.controller.js';
import { PrismaService } from './prisma.service.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SupabaseModule } from './supabase/supabase.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { CommentsModule } from './comments/comments.module.js';
import { NotificationController } from './notification/notification.controller.js';
import { NotificationService } from './notification/notification.service.js';
import { EmailModule } from './email/email.module.js';
import { RoomModule } from './room/room.module.js';
import { EquipmentModule } from './equipment/equipment.module.js';
import { ClubRequestModule } from './club-request/club-request.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SupabaseModule,
    AuthModule,
    UserModule,
    ApplicationsModule,
    CommentsModule,
    EmailModule,
    RoomModule,
    EquipmentModule,
    ClubRequestModule,
    RealtimeModule,
  ],
  controllers: [EventController, AppController, NotificationController],
  providers: [EventService, PrismaService, AppService, NotificationService],
})
export class AppModule {}
