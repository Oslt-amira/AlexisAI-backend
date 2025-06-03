export class InitPaymentDto {
  firstName: string;
  email: string;
  userId: string;
  duration: string;
}

export class CreatePaymentDto {
  paymentId: string;
  userId: string;
}
