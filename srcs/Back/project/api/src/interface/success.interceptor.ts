import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class EndMethodInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        const response = ctx.switchToHttp().getResponse<Response>();
        const request = ctx.switchToHttp().getRequest();
        const { url } = request;
        if (!url.includes('/auth/42')) {
          response.status(200).json({
            message: 'Success',
            data: data,
          });
        }
      }),
    );
  }
}