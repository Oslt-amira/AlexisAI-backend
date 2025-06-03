import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';

import { ChatModule } from './chat/chat.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PaymentsModule } from './payments/payments.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  controllers: [AppController],
  providers: [AppService, PrismaService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../public'),
      serveRoot: '/public/',
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ChatModule,
    PaymentsModule,
  ],
})
export class AppModule {}
