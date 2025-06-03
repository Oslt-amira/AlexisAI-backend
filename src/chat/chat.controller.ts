import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Sse,
  UploadedFile,
  UseInterceptors,
  MessageEvent,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs/internal/Observable';
import { concat, delay, from, interval, map, of } from 'rxjs';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  private message: any;

  @Post('setAPIKey/:field')
  async setKey(@Param('field') field: string) {
    try {
      return this.chatService.setAPIKey(field);
    } catch (error) {
      return {
        error:
          'Invalid field provided. Supported fields: Medical Field, Legal Studies,STEM',
      };
    }
  }

  @Get('conversations/:user')
  async getConversation(@Param('user') user: string) {
    try {
      const response = await this.chatService.getConversations(user);
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return { error: 'An error occurred' };
    }
  }

  @Get('conversations/:user/:conversation_id')
  async getConversationMessages(
    @Param('user') user: string,
    @Param('conversation_id') conversation_id: string,
  ) {
    try {
      const response = await this.chatService.getConversationMessages(
        user,
        conversation_id,
      );
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return { error: 'An error occurred' };
    }
  }

  @Post('conversations/:user/:conversation_id/:name')
  async renameConversation(
    @Param('user') user: string,
    @Param('conversation_id') conversation_id: string,
    @Param('name') name: string,
  ) {
    try {
      const response = await this.chatService.renameConversation(
        user,
        conversation_id,
        name,
      );
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return { error: 'An error occurred' };
    }
  }

  @Delete('conversations/:user/:conversation_id')
  async deleteConversation(
    @Param('user') user: string,
    @Param('conversation_id') conversation_id: string,
  ) {
    try {
      const response = await this.chatService.deleteConversation(
        user,
        conversation_id,
      );
      return response; 
    } catch (error) {
      console.error('Error processing message:', error);
      return { error: 'An error occurred' };
    }
  }

  // @Sse('sse')
  // sse(): Observable<MessageEvent> {
  //   if (!this.message) {
  //     return of<MessageEvent>(null);
  //   }

  //   const messageStreams: Observable<MessageEvent>[] = this.message
  //     ?.split('\n\n')
  //     ?.map((message) => from([message]));

  //   if (!messageStreams) {
  //     return of<MessageEvent>(null);
  //   }
  //   return concat(...messageStreams.map((stream) => stream.pipe(delay(1000))));
  // }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    console.log('SSE');
    return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
  }

  @Post('/:action')
  async chatAction(
    @Param('action') action: string,
    @Body() body: any,
    @Res() res,
  ): Promise<any> {
    const user = body.user;
    const query = body.query;
    const uploadedFiles = body.uploadedFiles || [];
    const mode = body.mode || null;
    let responseStream: any;

    if (action === 'NewChat') {
      responseStream = await this.chatService.chat(
        user,
        query,
        mode,
        undefined,
        uploadedFiles,
      );
      res.setHeader('Content-Type', 'text/event-stream');
      responseStream.on('data', (chunk) => {
        res.write(`${chunk.toString()}`);
      });
      responseStream.on('end', () => {
        res.end();
      });
      responseStream.on('error', (error) => {
        console.error('Error during streaming:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
      });
    } else if (action === 'ContinueChat') {
      const conversation_id = body.conversation_id;
      responseStream = await this.chatService.chat(
        user,
        query,
        mode,
        conversation_id,
        uploadedFiles,
      );
      res.setHeader('Content-Type', 'text/event-stream');
      responseStream.on('data', (chunk) => {
        res.write(`${chunk.toString()}`);
      });
      responseStream.on('end', () => {
        res.end();
      });
      responseStream.on('error', (error) => {
        console.error('Error during streaming:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
      });
    } else {
      throw new Error('Invalid action');
    }
  }

  @Post('conversations/file/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ): Promise<any> {
    const user = body.user;
    try {
      const response = await this.chatService.uploadfile(file, user);
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return { error };
    }
  }

  @Post('conversations/response/regenerate')
  async Regenerate(@Body() body: any, @Res() res) {
    const user = body.user;
    const conversation_id = body.conversation_id;
    const message = body.message;
    let responseStream: any;

    try {
      responseStream = await this.chatService.regenerateResponse(
        user,
        conversation_id,
        message,
      );
      res.setHeader('Content-Type', 'text/event-stream');
      responseStream.on('data', (chunk) => {
        res.write(`${chunk.toString()}`);
      });
      responseStream.on('end', () => {
        res.end();
      });
      responseStream.on('error', (error) => {
        console.error('Error during streaming:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
      });
    } catch (error) {
      console.error('Error processing message:', error);
      return { error: 'An error occurred' };
    }
  }

  @Post('conversations/response/details')
  async ShowMoreOrLessDetails(@Body() body: any, @Res() res) {
    const user = body.user;
    const conversation_id = body.conversation_id;
    const message = body.message;
    const preference = body.preference;
    let responseStream: any;

    try {
      responseStream = await this.chatService.showMoreOrLessDetails(
        user,
        conversation_id,
        message,
        preference,
      );
      res.setHeader('Content-Type', 'text/event-stream');
      responseStream.on('data', (chunk) => {
        res.write(`${chunk.toString()}`);
      });
      responseStream.on('end', () => {
        res.end();
      });
      responseStream.on('error', (error) => {
        console.error('Error during streaming:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
      });
    } catch (error) {
      console.error('Error processing message:', error);
      return { error: 'An error occurred' };
    }
  }

  @Post('conversations/response/rating')
  async rateMessage(@Body() body: any) {
    try {
      const response = await this.chatService.rateMessage(
        body.user,
        body.message_id,
        body.rating,
      );
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return { error: 'An error occurred' };
    }
  }
  @Post('conversations/response/stop')
  async stopGeneration(@Body() body: any) {
    try {
      const response = await this.chatService.stopGeneration(
        body.user,
        body.task_id,
      );
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return { error: 'An error occurred' };
    }
  }
}
