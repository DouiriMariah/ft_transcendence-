// import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UseGuards } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { Request, Response, NextFunction } from 'express';
// import { JwtGuard } from 'src/auth/guards';
// import { GetUser } from 'src/auth/decorator';

// @Injectable()
// export class InterceptorMiddleware implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     // Logique du middleware
//     // @UseGuards(JwtGuard)
//     // Vous pouvez également modifier la requête ici si nécessaire

//     // Passez la requête au gestionnaire de route (controller) suivant
//     return next.handle();
//   }
// }
