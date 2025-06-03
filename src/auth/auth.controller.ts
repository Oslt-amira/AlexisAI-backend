import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { MagicLinkStrategy } from './magicLink.strategy';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequestDto, refreshTokenDto } from './dto/authRequest.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly strategy: MagicLinkStrategy,
  ) {}

  @Post()
  login(@Req() req, @Res() res, @Body() body: AuthRequestDto) {
    this.authService.validateUser(body.destination);
    return this.strategy.send(req, res);
  }

  @UseGuards(AuthGuard('magiclogin'))
  @Get('callback')
  callback(@Req() req) {
    const token = this.authService.generateAccessToken(req.user);
    const refreshToken = this.authService.createRefreshToken(req.user);
    return {
      accessToken: token.accessToken,
      refreshToken: refreshToken,
      user: req.user,
    };
  }

  @Post('refresh')
  async refresh(@Req() req, @Body() body: refreshTokenDto) {
    const oldRefreshToken = body.refreshToken;
    const newTokens = await this.authService.generateRefreshToken(
      oldRefreshToken,
    );

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      user: req.user,
    };
  }
}
