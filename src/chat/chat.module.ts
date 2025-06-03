import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, UsersService, PrismaService],
})
export class ChatModule {}
