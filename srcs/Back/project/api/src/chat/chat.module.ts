import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { AuthService } from "src/auth/auth.service";
import {FileGateway } from "./chat_doc.gateway";
// import { WebSocketMiddleware } from "./WebSocket.middleware";
import { PrismaManagerModule } from "src/prisma_manager/prisma_manager.module";
import { MessageStore, SessionStore } from "./storage.service";
import { ChatService } from "./chat.service";



@Module({
    imports: [AuthService, PrismaManagerModule],
    providers: [FileGateway, SessionStore, MessageStore, ChatService],
})
export class ChatModule {
    
}
