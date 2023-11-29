import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
// import { AuthController } from './auth/auth.controller';
import { PrismaManagerModule } from './prisma_manager/prisma_manager.module';
import { ConfigModule,  ConfigService } from '@nestjs/config';
import { GameInstanceModule } from './game-instance/game-instance.module';
import { PassportModule } from '@nestjs/passport';

// import { IntraGuard } from './auth/guards/intra42.guard';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategy';
// import { InterceptorMiddleware } from './middleware/interceptor.middleware';
import { DataModule } from './database/database.module';
import { DataService } from './database/database.service';
import { APP_INTERCEPTOR, APP_FILTER , APP_PIPE} from '@nestjs/core';
import { AuthInterceptor } from './auth/strategy/auth.interceptor';
import { JwtGuard } from './auth/guards';
import { GuardExceptionFilter } from './auth/guards/guard-exception.filter';
import { ChatGateway } from './chat/chat.gateway';
import { FileGateway } from './chat/chat_doc.gateway';
import { MessageStore, SessionStore } from './chat/storage.service';
import { WebSocketMiddleware } from './chat/WebSocket.middleware';
import { ChatService } from './chat/chat.service';
import { GameService } from './chat/game.service';


@Module({
  imports: [
    
    
    
    PassportModule.register({ defaultStrategy: '42' }),
    ConfigModule.forRoot({isGlobal: true}),
     AuthModule,
     UsersModule, 
     PrismaManagerModule, GameInstanceModule,
    JwtModule, JwtModule.register({}), DataModule,
  ],
  providers: [
    {
    provide: APP_INTERCEPTOR,
    useClass: AuthInterceptor,
    },
    {
    provide: APP_FILTER,
    useClass: GuardExceptionFilter,
    },
    AppService, ConfigService,  AuthService, JwtStrategy, DataService, JwtGuard, FileGateway, SessionStore, MessageStore
    ,ChatService, GameService],
  controllers: [AppController],
})
export class AppModule {}
