import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Injectable()
export class Passport42Strategy extends PassportStrategy(Strategy, '42') {
  constructor(private authservice : AuthService, private readonly configService: ConfigService) {
    super({
      clientID: configService.get('42_CLIENT_ID'),
      clientSecret: configService.get('42_CLIENT_SECRET'),
      callbackURL: configService.get('42_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, cb: any) {
    
    const dto: AuthDto = new AuthDto();
    dto.email = profile._json.email;
    dto.nickname = profile.username;
  }
}