import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';

import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import path from 'path';
import { ChatService } from './chat.service';
import { json } from 'stream/consumers';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer() io: Server;

  afterInit() {
    this.logger.log('Initialized');
  }

  @SubscribeMessage('message')
  async handleMessage(client: any, payload: any) {
    if (payload.action === 'NewChat') {
      const responseStream = await this.chatService.chat(
        payload.userId,
        payload.query,
      );

      let accumulatedData = [];

      responseStream.on('data', (chunk) => {
        const chunkAsString = Buffer.from(chunk).toString('utf8');
        let jsonStr = chunkAsString.replace('data: ', '');

        let jsonObj;

        let chunks = chunkAsString
          .trim()
          .split('data: ')
          .filter((chunk) => chunk.trim() !== '' && chunk !== '\n');
        if (
          !chunks[chunks.length - 1].trim().replaceAll('\n', '').endsWith('}')
        ) {
          // console.log('chunks:', chunks);
          accumulatedData.push(chunks[chunks.length - 1]);

          chunks.forEach((chunk, index) => {
            if (index === chunks.length - 1) {
              return;
            }
            try {
              jsonObj = JSON.parse(chunk.trim());
            } catch (error) {
              console.log('error:', chunk);
              console.log('cutting off the last chunk');
              console.log('chunks:', chunks);
              return;
            }
            this.io.to(client.id).emit('message', jsonObj);
            return;
          });
          return;
        }

        if (!chunks[0].trim().replaceAll('\n', '').startsWith('{')) {
          chunks[0] = accumulatedData.join('') + chunks[0];
          accumulatedData = [];
          chunks.forEach((chunk, index) => {
            try {
              jsonObj = JSON.parse(chunk.trim());
            } catch (error) {
              console.log('error:', chunk);
              console.log('cutting off the first chunk');
              console.log('chunks:', chunks);
              return;
            }
            this.io.to(client.id).emit('message', jsonObj);
            return;
          });
        }

        chunks.forEach((chunk, index) => {
          try {
            jsonObj = JSON.parse(chunk.trim());
          } catch (error) {
            console.log('error:', chunk);
            return;
          }
          this.io.to(client.id).emit('message', jsonObj);
        });
      });
    }
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client id: ${client.id} connected`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Cliend id:${client.id} disconnected`);
  }
}
