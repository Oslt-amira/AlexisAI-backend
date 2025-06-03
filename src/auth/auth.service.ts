import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ResendService } from 'nestjs-resend';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import LoginCodeEmail from 'emails/magicLoginEmail';
import { render } from '@react-email/render';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly resendService: ResendService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates if the given user exists in the database, if not, creates a new user.
   * @param email - The email of the user to validate.
   * @returns The validated user.
   */
  async validateUser(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      return await this.usersService.create(email);
    }
    return user;
  }

  /**
   * Sends an email to the specified destination with a login link.
   *
   * @param destination - The email address of the recipient.
   * @param href - The login link.
   * @returns A promise that resolves when the email is sent successfully.
   */
  async sendEmail(destination: string, href: string) {
    const html = render(LoginCodeEmail({ href, destination }));
    return this.resendService.send({
      from: 'Alexis Team <something@resend.ccdev.space>',
      to: destination,
      subject: 'Login',
      html: html,
    });
  }

  /**
   * Generates an access token for the given user available for 1 day.
   * @param user - The user object.
   * @returns An object containing the access token.
   */
  generateAccessToken(user: any) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    return { accessToken: accessToken };
  }

  /**
   * Creates a refresh token for the specified user available for 7 days.
   * @param user - The user object.
   * @returns The signed refresh token.
   */
  createRefreshToken(user: any) {
    const tokenId = uuid();
    return this.jwtService.sign(
      { sub: user.id, email: user.email, tokenId: tokenId },
      { expiresIn: '7d' },
    );
  }

  /**
   * Decodes a refresh token and returns the data associated with it.
   * @param token - The refresh token to decode.
   * @returns The decoded refresh token.
   * @throws UnauthorizedException if the refresh token is invalid.
   */
  decodeRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validates a refresh token and returns the user associated with it.
   * @param token - The refresh token to validate.
   * @returns The user associated with the refresh token.
   * @throws UnauthorizedException if the refresh token is invalid.
   */
  async validateRefreshToken(token: string) {
    const decoded = this.decodeRefreshToken(token);
    const user = await this.usersService.findOne(decoded.email);
    if (user) {
      return user;
    }
    throw new UnauthorizedException('Invalid refresh token');
  }

  /**
   * Generates a new refresh token and access token for the given old refresh token.
   * @param token - The token to generate refresh and access tokens for.
   * @returns An object containing the new access token and refresh token.
   */
  async generateRefreshToken(token: string) {
    const user = this.validateRefreshToken(token);

    const newRefreshToken = this.createRefreshToken(user);
    const newAccessToken = this.generateAccessToken(user);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
