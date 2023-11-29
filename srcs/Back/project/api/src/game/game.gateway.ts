// import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway()
// export class AppGateway implements OnGatewayInit {
//   @WebSocketServer() server: Server;

//   private rooms: { [roomId: string]: string[] } = {}; // RoomId to player list mapping

//   afterInit(server: Server) {
//   }

//   @SubscribeMessage('joinRoom')
//   handleJoinRoom(client: Socket, roomId: string) {
//     if (!this.rooms[roomId]) {
//       this.rooms[roomId] = [client.id];
//       client.join(roomId);
//       client.emit('roomJoined', roomId);
//     } else if (this.rooms[roomId].length === 1) {
//       this.rooms[roomId].push(client.id);
//       client.join(roomId);
//       client.emit('roomJoined', roomId);
//       this.server.to(roomId).emit('gameStart');
//     } else {
//       client.emit('roomFull');
//     }
//   }

//   // Handle other game events like ball movement, scoring, etc.
// }