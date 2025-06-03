import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Injectable } from '@nestjs/common';
import Strategy from 'passport-magic-login';

@Injectable()
export class MagicLinkStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      secret: process.env.MAGIC_LINK_SECRET,
      callbackUrl: `${process.env.FRONTEND_BASE_URL}/verify`,
      jwtOptions: {
        expiresIn: '1d',
      },
      sendMagicLink: async (destination, href) => {
        return await this.authService.sendEmail(destination, href);
      },
      verify: async (payload, callback) => {
        callback(null, this.validate(payload));
      },
    });
  }

  async validate(payload: { destination: string }) {
    return this.authService.validateUser(payload.destination);
  }
}
