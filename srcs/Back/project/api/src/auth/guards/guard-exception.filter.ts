import { Catch, ExceptionFilter, ArgumentsHost, UnauthorizedException, ForbiddenException, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ExpiredToken } from './expiredToken.exception';

@Catch()
export class GuardExceptionFilter implements ExceptionFilter {

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const { url } = request;

    // Handle specific exceptions from guards or strategies
    if (exception) {
      if (exception instanceof UnauthorizedException) {
        response.status(401).json({
          message: 'Unauthorized by me',
        });
      } else if (exception instanceof ForbiddenException) {
        response.status(403).json({
          message: exception.message,
        });

      } else if (exception instanceof ExpiredToken) {
        response.status(200).json({
          message: 'ExpiredToken by me',
        });

      }
      else {
        if (url.includes('/auth/42') || url.includes('/auth/42/callback')) {
          let final = "http://" + process.env.POST_LOCAL + ":" + process.env.PORT_FRONT + "/";
          response.redirect(final);
        }
      }
    }
  }
}