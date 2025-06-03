import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResendModule } from 'nestjs-resend';

@Module({
  imports: [
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY,
    }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService],
})
export class PaymentsModule {}
