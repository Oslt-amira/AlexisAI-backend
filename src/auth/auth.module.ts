import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MagicLinkStrategy } from './magicLink.strategy';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResendModule } from 'nestjs-resend';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY,
    }),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
    PassportModule,
  ],

  controllers: [AuthController],
  providers: [
    AuthService,
    MagicLinkStrategy,
    UsersService,
    PrismaService,
    JwtStrategy,
  ],
})
export class AuthModule {}
