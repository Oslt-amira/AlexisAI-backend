import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import { render } from '@react-email/render';
import { PaymentConfirmationEmail } from 'emails/confirmPayment';
import { SubsciptionExpiryEmail } from 'emails/subsciptionExpiry';
import { SubsciptionReminderEmail } from 'emails/subscriptionReminder';
import { ResendService } from 'nestjs-resend';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly resendService: ResendService,
  ) { }

  // return a payment link to the frontend
  async initPayement(firstName: string, email: string, userId: string, duration: string) {
    try {
      const response = await axios.post(
        `${process.env.KONNECT_API_URL}/payments/init-payment`,
        {
          receiverWalletId: process.env.KONNECT_WALLET_ID,
          amount: duration === 'monthly' ? 49900 : duration === 'yearly' ? 39900 : 44900,
          token: 'TND',
          type: 'immediate',
          acceptedPaymentMethods: ['bank_card', 'e-DINAR'],
          firstName: firstName,
          email: email,
          webhook: `${process.env.BACKEND_BASE_URL}/payments/webhook/${userId}`,
          silentWebhook: true,
          successUrl: `${process.env.FRONTEND_BASE_URL}/paymentSuccess`,
          failUrl: `${process.env.FRONTEND_BASE_URL}/paymentFailure`,
        },
        {
          headers: {
            'x-api-key': process.env.KONNECT_API_KEY,
          },
        },
      );
      return response.data;
    } catch (e) {
      console.log(e);
    }
  }

  async verifyPayment(paymentId: string, userId: string) {
    try {
      const response = await axios.get(
        `${process.env.KONNECT_API_URL}/payments/${paymentId}`,
        {
          headers: {
            'x-api-key': process.env.KONNECT_API_KEY,
          },
        },
      );

      // check if the payment exists, if not, save it in the database
      const saveResponse = await this.savePayment(
        response.data.payment.id,
        response.data.payment.amount,
        response.data.payment.token,
        response.data.payment.transactions[0].status,
        userId,
      );

      // check if the payment already exists in the database, if it does, return
      if (!('existingPayment' in saveResponse)) {
        // add subscription to the user : set isPro to true and adds 1 month to proEndsAt
        const addSubscriptionResponse: any = await this.addSubscription(userId, response.data.payment.amount == 39900 ? 'yearly' : response.data.payment.amount == 44900 ? 'halfYearly' : 'monthly');

        // send a payment confirmation email to user
        await this.sendConfirmationEmail(
          addSubscriptionResponse.email,
          addSubscriptionResponse.name,
          response.data.payment.id,
          response.data.payment.transactions[0].method,
          new Date(),
          addSubscriptionResponse.proEndsAt,
        );
      } else {
        return {
          error: 'Payment already exists',
        };
      }
    } catch (e) {
      console.log(e);
    }
  }

  // check if the payment exists, if not, save it in the database
  async savePayment(
    paymentId: string,
    amount: number,
    currency: string,
    status: string,
    userId: string,
  ) {
    const existingPayment = await this.prismaService.payment.findUnique({
      where: {
        paymentRef: paymentId,
      },
    });

    if (existingPayment) {
      return {
        existingPayment: true,
      };
    }

    return this.prismaService.payment.create({
      data: {
        amount: amount,
        currency: currency,
        paymentRef: paymentId,
        status: status,
        userId: userId,
      },
    });
  }

  // add subscription to the user : set isPro to true and adds 1 month to proEndsAt
  async addSubscription(userId: string, duration: "monthly" | "yearly" | "halfYearly" = 'monthly') {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return {
          error: 'User not found',
        };
      }

      return await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          isPro: true,
          proEndsAt: new Date(
            user?.proEndsAt
              ? user?.proEndsAt.setMonth(duration == "monthly" ? user?.proEndsAt.getMonth() + 1 : duration == "yearly" ? user?.proEndsAt.getMonth() + 12 : user?.proEndsAt.getMonth() + 6)
              : new Date().setMonth(duration == "monthly" ? new Date().getMonth() + 1 : duration == "yearly" ? new Date().getMonth() + 12 : new Date().getMonth() + 6),
          ),
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  // send a payment confirmation email to user
  async sendConfirmationEmail(
    email: string,
    name: string,
    paymentId: string,
    paymentMethod: string,
    startDate: Date | null,
    endDate: Date | null,
  ) {
    const html = render(
      PaymentConfirmationEmail({
        name: name,
        startDate: startDate ?? new Date(),
        endDate:
          endDate ?? new Date(new Date().setMonth(new Date().getMonth() + 1)),
        paymentId: paymentId,
        paymentMethod: paymentMethod,
      }),
    );

    return this.resendService.send({
      from: 'Alexis Team <something@resend.ccdev.space>',
      to: email,
      subject: 'Payment Confirmation',
      html: html,
    });
  }

  @Cron('0 10 * * *')
  /**
   * Disables the subscription for users whose proEndsAt date falls within the current day.
   * this cron job runs every day at 10:00 AM
   */
  async disableSubscriptionJob() {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const users = await this.prismaService.user.findMany({
      where: {
        isPro: true,
        proEndsAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (users.length > 0) {
      const userIds = users.map((user) => user.id);
      const userEmails = users.map((user) => user.email);
      const updatedUsers = await this.prismaService.user.updateMany({
        where: {
          id: {
            in: userIds,
          },
        },
        data: {
          isPro: false,
        },
      });

      if (updatedUsers.count > 0) {
        userEmails.forEach(async (email) => {
          await this.sendSubscriptionExpiryEmail(email);
        });
      }
    }
  }

  @Cron('0 9 * * *')
  /**
   * Sends an email to users whose proEndsAt date falls after 3 days from the current day.
   * this cron job runs every day at 9:00 AM
   */
  async subscriptionReminderJob() {
    const now = new Date();
    const twoDaystFromNow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      23,
      59,
      59,
      999,
    );

    const threeDaysFromNow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 3,
      23,
      59,
      59,
      999,
    );

    const users = await this.prismaService.user.findMany({
      where: {
        isPro: true,
        proEndsAt: {
          gte: twoDaystFromNow,
          lte: threeDaysFromNow,
        },
      },
    });

    if (users.length > 0) {
      const userEmails = users.map((user) => user.email);
      userEmails.forEach(async (email) => {
        await this.sendSubscriptionReminderEmail(email);
      });
    }
  }

  // send an email to users whose subscription has expired
  async sendSubscriptionExpiryEmail(email: string) {
    const html = render(SubsciptionExpiryEmail());

    return this.resendService.send({
      from: 'Alexis Team <something@resend.ccdev.space>',
      to: email,
      subject: 'Subscription Expiry',
      html: html,
    });
  }

  // send an email to users whose subscription is about to expire in 3 days
  async sendSubscriptionReminderEmail(email: string) {
    const html = render(SubsciptionReminderEmail());
    return this.resendService.send({
      from: 'Alexis Team <something@resend.ccdev.space>',
      to: email,
      subject: 'A kind reminder',
      html: html,
    });
  }
}
