import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { JwtGuard } from '../guards';
import { Request } from 'express';
import { ExpiredToken } from '../guards/expiredToken.exception';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private readonly guard: JwtGuard, private config: ConfigService, private auth: AuthService) { }

  async VerifyCookie(secret: string, token: string, key: string, request: Request): Promise<any> {
    const secreti: string = this.config.get(secret);
    const payload = jwt.verify(token, secreti, { ignoreExpiration: false }) as { email: string; nickname: string };
    if (payload) {
      request.user = { email: payload.email, nickname: payload.nickname };
      return true;
    }
    else
      return false;
  };

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const { url } = request;
    const response = context.switchToHttp().getResponse();

    if (request.headers.cookie) {
      if (url.includes('/auth/42')) {
        return next.handle();
      }
      const cookies: string[] | undefined = request.headers.cookie.split('; ');
      const hasAccessTokenCookie = cookies.find((cookie) => cookie.startsWith('accessToken='));
      const hasRefreshTokenCookie = cookies.find((cookie) => cookie.startsWith('refreshToken='));
      const refreshToken = hasRefreshTokenCookie ? hasRefreshTokenCookie.split('=')[1] : '';
      const accessToken = hasAccessTokenCookie ? hasAccessTokenCookie.split('=')[1] : '';

      if (!(hasAccessTokenCookie && hasRefreshTokenCookie)) {
        await this.auth.deleteCookies(response, "accessToken", accessToken);
        await this.auth.deleteCookies(response, "refreshToken", refreshToken);
        throw new ExpiredToken('Unvalid refreshToken', { key: "", value: "" });
      }
      else if (hasAccessTokenCookie && hasRefreshTokenCookie) {
        try {
          const check_access = await this.VerifyCookie("JWT_SECRET", accessToken, "accessToken", request);
          if (check_access) {
            const check = await this.VerifyCookie("JWT_REFRESH_SECRET", refreshToken, "refreshToken", request);
            if (check) {
              await this.auth.verifyRefreshToken(request.cookies, { email: request.user.email, nickname: request.user.nickname }, response);
            }
          }
        } catch {
          await this.auth.deleteCookies(response, "accessToken", accessToken);
          await this.auth.deleteCookies(response, "refreshToken", refreshToken);
          throw new ExpiredToken('Unvalid refreshToken', { key: "", value: "" });
        }
      }
    }
    if (!request.headers.cookie) {
      if (!url.includes('/auth/42')) {
        throw new ExpiredToken('Unvalid refreshToken', { key: "refreshToken", value: "" });
      }
    }
    return next.handle();
  }
}