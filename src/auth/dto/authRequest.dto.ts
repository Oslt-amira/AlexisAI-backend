export class AuthRequestDto {
  readonly destination: string;
}

export class refreshTokenDto {
  readonly refreshToken: string;
  readonly accessToken: string;
}
