import { Injectable, NestMiddleware } from '@nestjs/common';
import { SessionStore } from './storage.service';
import { CustomSocket } from 'src/interface/success-response.interface';


@Injectable()
export class WebSocketMiddleware implements NestMiddleware {
  constructor(private sessionStore: SessionStore) { }
  async use(socket: CustomSocket, next: () => void) {
    next();
  }
}