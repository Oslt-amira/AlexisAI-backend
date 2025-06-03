import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitPaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  initPayment(@Body() body: InitPaymentDto) {
    return this.paymentsService.initPayement(
      body.firstName,
      body.email,
      body.userId,
      body.duration
    );
  }

  @Post('/testEmail')
  async sendConfirmationEmail(@Body() body: any) {
    return this.paymentsService.sendConfirmationEmail(
      body.email,
      body.name,
      body.paymentId,
      body.paymentMethod,
      null,
      null,
    );
  }

  @Get('/webhook/:userId')
  webhook(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Query('payment_ref') paymentRef: string,
  ) {
    return this.paymentsService.verifyPayment(paymentRef, userId);
  }
}
