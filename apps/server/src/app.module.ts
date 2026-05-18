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

@Module({
  imports: [ConfigModule.forRoot(), SupabaseModule, AuthModule, UserModule, ApplicationsModule, CommentsModule],
  controllers: [EventController, AppController],
  providers: [EventService, PrismaService, AppService],
})
export class AppModule {}
