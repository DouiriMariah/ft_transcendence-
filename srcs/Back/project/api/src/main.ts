import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { GuardExceptionFilter } from './auth/guards/guard-exception.filter';
import { config } from 'dotenv';
import * as cors from 'cors';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { WsAdapter,  } from '@nestjs/platform-ws';
import { MyWebSocketMiddleware } from './middleware/auth-ws.middleware';
import { EndMethodInterceptor } from './interface/success.interceptor';


async function bootstrap() {
  config(); 
  const app = await NestFactory.create(AppModule);
  
  // Configuration des en-têtes CORS
  // app.enableCors({ origin: 'http://localhost:8000', credentials: true });
  app.useGlobalInterceptors(new EndMethodInterceptor());

  
  // const frontendDomain = "http://" + process.env.POST_LOCAL + ":" + process.env.PORT_FRONT;w

  // app.enableCors({
	// 	origin: [ 'http://10.*.*.*:8000'],
	// 	allowedHeaders: ['content-type', 'Authorization'],
	// 	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
	// 	// preflightContinue: false,
	// 	optionsSuccessStatus: 204,
	// 	credentials: true,
	// });
  
  // app.enableCors({
  //   credentials: true,
  // });
  // const frontendDomain = `http://${process.env.POST_LOCAL}:${process.env.PORT_FRONT}`;
  const frontendDomain = "http://" + process.env.POST_LOCAL + ":" + process.env.PORT_FRONT


  app.enableCors({
    origin: [frontendDomain],
    methods: ['GET', 'POST', 'PUT','PATCH','DELETE',],
    credentials: true,
  });

  
  // const corsOptions = {
  //   origin: 'http://localhost:8000' ,  // Replace with your frontend URL
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'DELETE'],
  //   // allowedHeaders: ['content-type', 'Authorization'],
  // };
  // app.enableCors(corsOptions);
  // app.use(cors(corsOptions));

  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalInterceptors(new InterceptorMiddleware());

  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalInterceptors(new InterceptorMiddleware());

  app.useGlobalFilters(new GuardExceptionFilter());
  app.use(cookieParser());
  await app.listen(4000);
}
bootstrap();
