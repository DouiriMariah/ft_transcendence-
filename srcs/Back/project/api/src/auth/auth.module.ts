import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaManagerModule } from 'src/prisma_manager/prisma_manager.module';


import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshStrategy } from './strategy';
import { JwtGuard } from './guards';
import { TwoFactorAuthenticationService } from './a2f.service';

@Module({
  imports: [PrismaManagerModule,  JwtModule.register({})], 
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, JwtGuard,
    TwoFactorAuthenticationService],
  controllers: [AuthController]
})
export class AuthModule {}
