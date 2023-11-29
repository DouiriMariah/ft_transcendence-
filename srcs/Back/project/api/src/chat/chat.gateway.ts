import { Server, Socket } from "socket.io";
import { WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, MessageBody } from '@nestjs/websockets';


@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users = [];

  afterInit() {}

  handleConnection(socket: Socket) {
    socket.on('message', (data) => {
      this.server.emit('messageResponse', data);
    });

    socket.on('typing', (data) => {
      socket.broadcast.emit('typingResponse', data);
    });

    socket.on('newUser', (data) => {
      this.users.push(data);
      this.server.emit('newUserResponse', this.users);
    });
  }

  handleDisconnect(socket: Socket) {
    this.users = this.users.filter((user) => user.socketID !== socket.id);
    this.server.emit('newUserResponse', this.users);
    socket.disconnect();
  }
}
