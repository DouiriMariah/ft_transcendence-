import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { MessageStore, SessionStore } from 'src/chat/storage.service';
import { CustomSocket } from 'src/interface/success-response.interface';
import { PrismaManagerService } from 'src/prisma_manager/prisma_manager.service';

@Injectable()
export class MyWebSocketMiddleware{

  constructor(private prisma: PrismaManagerService, private sessionStore: SessionStore, private messageStore: MessageStore){}

  async resolve(socket: CustomSocket, next: (err?: any) => void) {
      const sessionIDnotString = socket.handshake.auth.sessionID;
      const sessionID = JSON.stringify(sessionIDnotString);
      if (sessionID) {
        const session = await this.sessionStore.findSession(sessionID);
        if (session) {
          socket.sessionId = sessionID;
          socket.userId = session.userId;
          socket.username = session.username;
          return next(); // Continue to the next middleware or route handler
        }
      }
      
      const username = socket.handshake.auth.username;
      if (!username) {
        return next(new Error('Invalid username'));
      }
      
      socket.sessionId = randomBytes(8).toString('hex');
      socket.userId = randomBytes(8).toString('hex');
      socket.username = username;
      return next(); // Continue to the next middleware or route handler
  }
}