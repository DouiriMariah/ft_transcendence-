import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { randomBytes } from 'crypto';
import { MessageStore, SessionStore } from './storage.service';
import { Injectable } from '@nestjs/common';
import { CustomSocket, GroupChat, MatchForm, MessageForm } from 'src/interface/success-response.interface';
import { SessionDto } from 'src/auth/dto';
import { PrismaManagerService } from 'src/prisma_manager/prisma_manager.service';
import { ChatService } from './chat.service';
import { GameService } from './game.service';
import * as argon2 from 'argon2';

enum StatusConnection {
  USER_EXIST,
  ERROR,
  NEW_USER,
}

@Injectable()
@WebSocketGateway({ cors: true })
export class FileGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private prisma: PrismaManagerService, private sessionStore: SessionStore, private messageStore: MessageStore,
    private service: ChatService, private instance: GameService) { }
  @WebSocketServer() server: Server;

  private custom_room = [];
  private list_room = [];
  private muted_list: { username: string, timeoff: number, chat_name: string }[] = [];

  addMinutesToCurrentTime(minutesToAdd: number): number {
    const currentTime = new Date();
    const newTime = new Date(currentTime.getTime() + minutesToAdd * 60000); // 1 minute = 60000 milliseconds

    return newTime.getTime();
  }

  async ControlMuted(socket: CustomSocket) {
    this.muted_list.forEach(async (item) => {
      if (item.timeoff <= Date.now()) {
        await this.service.UnMuteUser(item.username, item.chat_name);
        const chati = await this.service.FindChat(item.chat_name);
        if (chati) {
          this.server.to(chati.chat_name).emit("modif", chati);
        }
        this.muted_list = this.muted_list.filter(user => user !== item);
        if (this.muted_list.length === 0) {
          return;
        }
      }
    });
  }

  async CreateMutedChrono(newObject: { username: string; timeoff: number; chat_name: string }) {
    newObject.timeoff = this.addMinutesToCurrentTime(2);
    this.muted_list.push(newObject);
  }

  async use(socket: CustomSocket): Promise<StatusConnection> {
    const username = socket.handshake.auth.username;
    if (!username) {
      return StatusConnection.ERROR;
    }
    const real_user = await this.prisma.user.findUnique({
      where: {
        nickname: username,
      }
    })
    if (!real_user) {
      return StatusConnection.ERROR;
    }
    const session = await this.sessionStore.findNickname(username);
    if (session) {
      socket.sessionId = session.sessionId;
      socket.userId = session.userId;
      socket.username = session.username;
      socket.status = session.connected;
      return StatusConnection.USER_EXIST;
    }
    socket.sessionId = randomBytes(8).toString('hex'); //a session ID, private, which will be used to authenticate the user upon reconnection
    socket.userId = randomBytes(8).toString('hex');//a user ID, public, which will be used as an identifier to exchange messages
    socket.username = username;
    return StatusConnection.NEW_USER;
  }

  async handleConnection(socket: CustomSocket) {
    let test = await this.use(socket);
    if (test == StatusConnection.ERROR)
      return;
    const dto = new SessionDto;
    dto.sessionId = socket.sessionId;
    dto.userId = socket.userId;
    dto.username = socket.username;
    // console.log("socket.status = " + socket.status + "for : " + socket.username);
    if (socket.status === "ingame")
      dto.connected = "ingame";
    else {
      dto.connected = "online";
      socket.status = "online"; 
    }
    const me = await this.sessionStore.saveSession(socket.username, dto);
    if (!me) {
      return StatusConnection.ERROR;
    }
    socket.join(socket.userId);

    this.server.to(socket.userId).emit('session', {
      user_info: me,
      block: me.user.blacklist,
      stalk: me.user.blocklist,
    });

    // socket.emit('session', {
    //   user_info: me,
    //   block: me.user.blacklist,
    //   stalk: me.user.blocklist,
    // });
    const users = [];
    const sessions = await this.sessionStore.findAllSessions();
    if (sessions)
      this.server.emit('users', sessions);
    const channels_list = await this.service.FindAllChannel();
    if (channels_list)
      this.server.emit("rooms_list", channels_list);
  }

  async handleDisconnect(socket: CustomSocket) {
    let test = await this.use(socket);
    if (test === StatusConnection.ERROR)
      return;

    const matchingSockets = await this.server.in(socket.userId).fetchSockets();
    const isDisconnected = matchingSockets.length === 0;
    if (isDisconnected) {
      const dto = new SessionDto;
      dto.userId = socket.userId;
      dto.username = socket.username;
      dto.connected = "offline";
      dto.sessionId = socket.sessionId;
      socket.status = "offline";
      await this.sessionStore.saveSession(socket.username, dto);
      await this.StopPlaying(socket);
      await this.sessionStore.SessionStatus(socket.username, dto.connected);
      const sessions = await this.sessionStore.findAllSessions();
      if (sessions) {
        this.server.emit('users', sessions);
      }
    }
  }

  @SubscribeMessage("co2")
  async PseudoConnect(socket: CustomSocket) {
    await this.handleConnection(socket);
  }



  @SubscribeMessage("protected_channel")
  async handleProtectedChannel(socket: CustomSocket, payload: { mdp: string, channel: ft_Chat }) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    let test = await argon2.verify(payload.channel.protected, payload.mdp);
    this.server.to(socket.userId).emit("IsProtected", {
      test: test,
      chan: payload.channel.id,
    });
    // socket.emit("IsProtected", {
    //   test: test,
    //   chan: payload.channel.id,
    // });
  }

  @SubscribeMessage("findDm")
  async retrieveDm(socket: CustomSocket, friend: string) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    const chat = await this.service.FindDm(friend, socket.username);
    // socket.emit("ActualDm", chat);
    this.server.to(socket.userId).emit("ActualDm", chat);
  }

  @SubscribeMessage("findChan")
  async findChannel(socket: CustomSocket, chat_id: number) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    const chat = await this.service.FindChannel(chat_id);
    if (chat) {
      const user_presence = chat.users.find((user) => user.username === socket.username);
      if (user_presence) {
        socket.join(chat.chat_name);
        this.server.to(socket.userId).emit("ActualChan", chat);
        // socket.emit("ActualChan", chat);
      }
      await this.AreYouBanned(socket, chat_id);
    }
  }

  @SubscribeMessage('private message')
  async handlePrivateMessage(socket: CustomSocket, payload: { content: string; to: string, to_username: string }) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    const message: MessageForm = {
      name_chat: "",
      from: socket.username,
      from_id: socket.userId,
      to_id: payload.to,
      to: payload.to_username,
      content: payload.content,
    };
    socket.to(payload.to).emit('private message', message);
    this.server.to(socket.userId).emit('private message', message);

    const chat_name = message.from + '_dm_' + message.to;
    const chat_name2 = message.to + '_dm_' + message.from;
    let test1 = await this.service.FindChat(chat_name);
    let test2 = await this.service.FindChat(chat_name2);
    if (!test1 && !test2) {
      let groupChat: GroupChat = {
        name_chat: chat_name,
        type: "dm",
        protected: "",
        maxUsers: 2,
        owner_group_chat: socket.username,
      };
      await this.service.CreateChat(groupChat);
      message.name_chat = chat_name;
    }
    else if (test1) {
      message.name_chat = chat_name;
    }
    else {
      message.name_chat = chat_name2;
    }
    await this.service.AddMessageToChat(message);
  }

  @SubscribeMessage('create_channel')
  async createGroupChat(socket: CustomSocket, payload: { chat_name: string, password: string, type: string }) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    let password = "";
    if (payload.password) {
      password = await argon2.hash(payload.password);
    }
    let groupChat: GroupChat = {
      name_chat: payload.chat_name,
      type: "channel_" + payload.type,
      protected: password,
      maxUsers: 0,
      owner_group_chat: socket.username,
    };
    const channel = await this.service.CreateChat(groupChat);
    socket.join(payload.chat_name);
    const message: MessageForm = {
      name_chat: payload.chat_name,
      from: socket.username,
      from_id: socket.userId,
      to_id: payload.chat_name,
      to: payload.chat_name,
      content: "Welcome to " + payload.chat_name,
    };
    if (!channel)
      await this.handleGroupChat(socket, { rooms_name: message.name_chat, content: message.content });
    else {
      this.server.to(payload.chat_name).emit("NewChatCreated", message);
    }
    const channels_list = await this.service.FindAllChannel();
    if (channels_list) {
      this.server.emit("rooms_list", channels_list);
    }
  }

  @SubscribeMessage('group_chat')
  async handleGroupChat(socket: CustomSocket, payload: { rooms_name: string, content: string }) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    const chati = await this.service.FindChat(payload.rooms_name);
    if (chati) {
      const user_presence = chati.banned.find((user) => user.username === socket.username);
      if (user_presence) {
        return;
      }
      else if (chati.muted.find((user) => user.username === socket.username))
        return;
      else if (chati.type === "channel_private" && !(chati.users.find((user) => user.username === socket.username))) {
        await this.PrivChat(socket, chati.id);
        return;
      }
    }
    socket.join(payload.rooms_name);
    const users = await this.service.AddUserToChat(socket.username, payload.rooms_name);
    const message: MessageForm = {
      name_chat: payload.rooms_name,
      from: socket.username,
      from_id: socket.userId,
      to_id: payload.rooms_name,
      to: payload.rooms_name,
      content: payload.content,
    };
    await this.service.AddMessageToChat(message);
    this.server.to(payload.rooms_name).emit("group_chat", message);
    const chat = await this.service.FindChat(payload.rooms_name);
    if (chat) {
      this.server.to(payload.rooms_name).emit("modif", chat);
    }
  }

  @SubscribeMessage("BannedOne")
  async AreYouBanned(socket: CustomSocket, chat_id: number) {
    const rep = await this.service.BannedOne(socket.username, chat_id);
    this.server.to(socket.userId).emit("ImBanned", {
      rep: rep,
      id: chat_id,
    });
    // socket.emit("ImBanned", {
    //   rep: rep,
    //   id: chat_id,
    // });
  }

  @SubscribeMessage("Admin")
  async BecomeAdmin(socket: CustomSocket, payload: { new_admin: string, chat: ft_Chat }) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return
    await this.service.AdminUsers(payload.new_admin, payload.chat.chat_name);
    const chati = await this.service.FindChannel(payload.chat.id);
    if (chati) {
      this.server.to(chati.chat_name).emit("modif", chati);
    }
  }

  @SubscribeMessage("Mute")
  async MuteSomeone(socket: CustomSocket, payload: { user_muted: string, chat: ft_Chat }) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    await this.service.MutedUsers(payload.user_muted, payload.chat.chat_name);
    await this.CreateMutedChrono({
      username: payload.user_muted,
      timeoff: 0,
      chat_name: payload.chat.chat_name,
    })
    const chati = await this.service.FindChannel(payload.chat.id);
    if (chati) {
      this.server.to(chati.chat_name).emit("modif", chati);
    }
  }

  @SubscribeMessage("Muted_list")
  async Muted_check(socket: CustomSocket) {
    await this.ControlMuted(socket);
  }

  @SubscribeMessage("UnMute")
  async UnMuteSomeone(socket: CustomSocket, payload: { user_muted: string, chat: ft_Chat }) {
    await this.service.UnMuteUser(payload.user_muted, payload.chat.chat_name);
    this.muted_list = this.muted_list.filter(user => user.username !== payload.user_muted);
    const chati = await this.service.FindChannel(payload.chat.id);
    if (chati) {
      this.server.to(chati.chat_name).emit("modif", chati);
    }
  }

  @SubscribeMessage("Ban")
  async BanUser(socket: CustomSocket, payload: { user_banned: string, chat: ft_Chat }) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    const check_banners = await this.service.BannedUsers(payload.user_banned, payload.chat.chat_name);
    if (check_banners) {
      const userBanned = await this.sessionStore.findNickname(payload.user_banned);
      if (userBanned) {
        this.server.to(userBanned.userId).emit("ImBanned", {
          rep: true,
          id: payload.chat.id,
        });

      }
    }
    const chati = await this.service.FindChannel(payload.chat.id);
    if (chati) {
      this.server.to(chati.chat_name).emit("modif", chati);
    }
  }

  @SubscribeMessage("Unban")
  async UnBanUser(socket: CustomSocket, payload: { user_banned: string, chat: ft_Chat }) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    await this.service.UnbannedUser(payload.user_banned, payload.chat.chat_name);
    const userBanned = await this.sessionStore.findNickname(payload.user_banned);
    if (userBanned) {
      this.server.to(userBanned.userId).emit("ImBanned", {
        rep: false,
        id: payload.chat.id,
      });
    }
    const chati = await this.service.FindChannel(payload.chat.id);
    if (chati) {
      this.server.to(userBanned.userId).emit("kicked", chati);
      this.server.to(chati.chat_name).emit("modif", chati);
    }
  }

  @SubscribeMessage("Kick")
  async KickFromChat(socket: CustomSocket, payload: { user_kicked: string, chat: ft_Chat }) {
    // let check = await this.use(socket);
    // if (check === StatusConnection.ERROR)
    //   return;
    const userBanned = await this.sessionStore.findNickname(payload.user_kicked);
    if (userBanned) {
      this.server.to(userBanned.userId).emit("kicked", { id: payload.chat.id, });
    }
  }

  @SubscribeMessage("change-password") //tester avec l'ancien docker 
  async modifyPwd(socket: CustomSocket, payload: { chan: string, pwd: string, action: string }) {
    const chat_name = payload.chan;
    if (payload.action === "modify") {
      if (payload.pwd) {
        const password = await argon2.hash(payload.pwd);
        await this.service.ChangePassword(password, payload.chan);
      }
    }
    else {
      await this.service.DeletePassword(payload.chan);
    }
    await this.sendListChan(socket);
  }

  @SubscribeMessage("Private")
  async PrivChat(socket: CustomSocket, channel: number) {
    const chat = await this.service.FindChannel(channel);
    if (chat) {
      const owner = await this.sessionStore.findNickname(chat.owner_group_chat);
      if (owner) {
        this.server.to(owner.userId).emit("priv_inv", {
          add_user: socket.username,
          chat_id: channel,
        });
      }
    }
  }

  @SubscribeMessage("Private_users")
  async ChatPrivate(socket: CustomSocket, channel: number) {
    const chat = await this.service.FindChannel(channel);
    const check = await this.service.AlreadyInTheCHat(socket.username, chat.chat_name);
    if (check) {
      this.server.to(socket.userId).emit("InChat", channel);
      // socket.emit("InChat", channel);
    }
  }

  @SubscribeMessage("Add_inv")
  async AddInv(socket: CustomSocket, payload: { channel: number, add_user: string }) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    await this.service.AddUserToChatId(payload.add_user, payload.channel);
    const chat = await this.service.FindChannel(payload.channel);
    if (chat) {
      const user = await this.sessionStore.findNickname(payload.add_user);
      if (user) {
        this.server.to(user.userId).emit("inv_accepted", payload.channel);
      }
      this.server.to(chat.chat_name).emit("modif", chat);
    }
  }

  @SubscribeMessage("Refuse_inv")
  async RefuseInv(socket: CustomSocket, payload: { channel: number, refuse_user: string }) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    const chat = await this.service.FindChannel(payload.channel);
    if (chat) {
      const user = await this.sessionStore.findNickname(payload.refuse_user);
      if (user) {
        this.server.to(user.userId).emit("inv_refused", payload.channel);
      }
    }
  }

  @SubscribeMessage("LeaveChat")
  async LeaveChat(socket: CustomSocket, channel: ft_Chat) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    const chat = await this.service.FindChannel(channel.id);
    if (chat) {
      await this.service.DeleteUser(socket.username, chat.chat_name);
    }
    const chati = await this.service.FindChannel(channel.id);
    if (chati) {
      this.server.to(chati.chat_name).emit("modif", chati);
      this.server.to(socket.userId).emit("clean", chati.chat_name);
      // socket.emit("clean", chati.chat_name);
      socket.leave(chati.chat_name);
    }
  }

  @SubscribeMessage('stop_waiting')
  async StopPlaying(socket: CustomSocket) {
    const updatedCustomRoom = this.custom_room.filter(item => item !== socket); //je crois que ca sert a rien 
    const updatedListRoom = [];

    for (const item of this.list_room) {
      const splitted = item.split("_");
      if (splitted && (splitted[0] === socket.username || splitted[1] === socket.username)) {
        socket.leave(item);
        await this.sessionStore.SessionStatus(socket.username, "online");
        const room = this.server.sockets.adapter.rooms.get(item);

        if (room) {
          updatedListRoom.push(item);
        }
      } else {
        updatedListRoom.push(item);
      }
    }

    this.custom_room = updatedCustomRoom;
    this.list_room = updatedListRoom;
  }

  @SubscribeMessage('CheckInvite')
  async handleInviteAccepted(socket: CustomSocket) {
    let game = false;
    for (const item of this.list_room) {
      const splitted = item.split("_");

      if (splitted && (splitted[0] === socket.username || splitted[1] === socket.username)) {
        await this.sessionStore.SessionStatus(splitted[0], "ingame");
        await this.sessionStore.SessionStatus(splitted[1], "ingame");
        const message = {
          player1: splitted[0],
          player2: splitted[1],
          room_name: item,
        }
        const sessions = await this.sessionStore.findAllSessions();
        this.server.emit('users', sessions);
        this.server.to(item).emit("Opponent_found", message);
        game = true;
        return true;
      }
    }
    if (game) {
      return true;
    }
    else {
      return false;
    }
  }

  @SubscribeMessage('status')
  async sendStatus(socket: CustomSocket) {
    // let test = await this.use(socket);
    // if (test == StatusConnection.ERROR)
    //   return;
    const user = await this.sessionStore.findNickname(socket.username);
    if (user) {
      socket.status = user.connected;
      this.server.to(socket.userId).emit("status_user", user.connected);
      // socket.emit("status_user", user.connected);
    }
  }

  @SubscribeMessage('waiting_player')
  async handlePlayers(socket: CustomSocket) {
    let invite = await this.handleInviteAccepted(socket);
    if (invite) {
      return;
    }
    let player1;
    let player2;
    let custom_room_name = "";
    if (this.custom_room.length < 2) {
      const check = this.custom_room.find((element) => element.username === socket.username);
      if (check) {
        return;
      }
      this.custom_room.push(socket);
      if (this.custom_room.length === 2) {
        player1 = this.custom_room[0];
        player2 = this.custom_room[1];
        custom_room_name = player1.username + '_' + player2.username;
        this.custom_room.splice(0, 2);
      }
    }
    if (custom_room_name) {
      player1.join(custom_room_name);
      player1 = '';
      player2.join(custom_room_name);
      player2 = '';
      const check = this.server.sockets.adapter.rooms.has(custom_room_name)
      if (check) {
        const room = this.server.sockets.adapter.rooms.get(custom_room_name);
        if (room.size === 2) {
          const splitArray = custom_room_name.split("_");
          await this.sessionStore.SessionStatus(splitArray[0], "ingame");
          await this.sessionStore.SessionStatus(splitArray[1], "ingame");
          const message = {
            player1: splitArray[0],
            player2: splitArray[1],
            room_name: custom_room_name,
          }
          this.list_room.push(custom_room_name);
          const sessions = await this.sessionStore.findAllSessions();
          this.server.emit('users', sessions);
          this.server.to(custom_room_name).emit("Opponent_found", message);
        }
      }
    }
  }

  @SubscribeMessage('MyGame')
  async handleMyGame(socket: CustomSocket) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    for (const item of this.list_room) {
      const splitted = item.split("_");
      if (splitted && (splitted[0] === socket.username || splitted[1] === socket.username)) {
        const message = {
          player1: splitted[0],
          player2: splitted[1],
          room_name: item,
        }
        this.server.to(item).emit("GameOn", message);
      }

    }
  }

  @SubscribeMessage("EndGame")
  async EndMyGame(socket: CustomSocket) {
    // let test = await this.use(socket);
    // if (test == StatusConnection.ERROR)
    //   return;
    const moi = await this.sessionStore.findNickname(socket.username);
    for (const item of this.list_room) {
      const splitted = item.split("_");
      if (splitted && (splitted[0] === socket.username || splitted[1] === socket.username)) {
        if (moi && moi.connected === "ingame") {
          // console.log("je suis dans EndGame = " + socket.username)
          socket.leave(item);
          socket.status = "online";
          await this.sessionStore.SessionStatus(socket.username, "online");
          // await this.sendStatus(socket);
          // await this.UpdateSession(socket);
        }
      }
    }
  }

  @SubscribeMessage("InviteToGame")
  async handleInvite(socket: CustomSocket, payload: { opponent: string }) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    const player2 = await this.sessionStore.findNickname(payload.opponent)
    if (player2 && player2.connected === "online" && socket.status === "online") //je check aussi le status in game ou pas
    {
      await this.StopPlaying(socket);
      const custom_room_name = socket.username + "_" + player2.username;
      socket.join(custom_room_name);
      this.server.to(player2.userId).emit("InviteGame", socket.username); //chrono a lancer pour rep
    }
    else
        this.server.to(socket.userId).emit("NoGame");
      // socket.emit("NoGame"); //Donc on lance pas le modal
  }

  @SubscribeMessage("NoGameAnymore")
  async DontInvite(socket: CustomSocket, opponent: string) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    if (opponent) {
      let player1 = await this.sessionStore.findNickname(opponent);
      this.server.to(player1.userId).emit("NoGame");
    }
    await this.StopPlaying(socket);

  }


  @SubscribeMessage("GoGame")
  async handleGame(socket: CustomSocket, opponent: string) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    await this.StopPlaying(socket);
    let player1 = await this.sessionStore.findNickname(opponent);
    const custom_room_name = player1.username + "_" + socket.username;
    socket.join(custom_room_name);
    const message = {
      player1: player1.username,
      player2: socket.username,
      room_name: custom_room_name,
    }
    this.list_room.push(custom_room_name);
    this.server.to(player1.userId).emit("GameAccepted");
  }

  @SubscribeMessage('Score')
  handleScore(socket: CustomSocket, payload: { rooms_name: string, content: ft_GameRoom }) {
    const message = {
      player1Score: payload.content.player1Score,
      player2Score: payload.content.player2Score,
    }
    const spectatorRoomName = `spectator_${payload.rooms_name}`;
    this.server.to(spectatorRoomName).emit("gameStateScore", message);
    this.server.to(payload.rooms_name).emit("ScoreResponse", message);
  }

  @SubscribeMessage('ballMovement')
  handleLive(socket: CustomSocket, payload: { rooms_name: string, content: ft_GameRoom }) {
    const message = {
      ballY: payload.content.ballY,
      ballX: payload.content.ballX,
      ballSpeedY: payload.content.ballSpeedY,
      ballSpeedX: payload.content.ballSpeedX,
    }
    this.server.to(payload.rooms_name).emit("messageBall", message);
    const spectatorRoomName = `spectator_${payload.rooms_name}`;
    this.server.to(spectatorRoomName).emit("gameStateBall", message);
    this.handleKill(socket, payload.rooms_name, payload.content.path);
  }

  @SubscribeMessage('paddleMovement')
  handlePlayer(socket: CustomSocket, payload: { rooms_name: string, content: ft_GameRoom }) {
    const message = {
      paddle1Y: payload.content.paddle1Y,
      paddle2Y: payload.content.paddle2Y,
    };
    socket.to(payload.rooms_name).emit("messagePaddle", message);

    const spectatorRoomName = `spectator_${payload.rooms_name}`;
    this.server.to(spectatorRoomName).emit("gameStatePaddle", message);
  }

  @SubscribeMessage("room_list")
  SendRoomsList(socket: CustomSocket) {
    this.server.to(socket.userId).emit("List_room", this.list_room);
    // socket.emit("List_room", this.list_room);
  }


  @SubscribeMessage("spectatorJoin")
  handleSpectatorJoin(socket: CustomSocket, matchId: string) {
    socket.join(matchId);
  }

  @SubscribeMessage('spectatorLeave')
  handleSpectatorLeave(socket: CustomSocket, payload: { matchId: string }) {
    const spectatorRoomName = `spectator_${payload.matchId}`;
    socket.leave(spectatorRoomName);
  }


  @SubscribeMessage('game_over') //enregister dans la base de donnée pour match history
  async finishgame(socket: CustomSocket, payload: { rooms_name: string, content: ft_GameRoom }) {
    await this.sessionStore.SessionStatus(socket.username, "online");
    socket.status = "online";
    const message = {
      winner: payload.content.winner,
      player1Score: payload.content.player1Score,
      player2Score: payload.content.player2Score,
      from: socket.userId,
      to: payload.rooms_name,
    };
    const splitArray = payload.rooms_name.split("_");
    const winner = message.player1Score > message.player2Score ? message.player1Score : message.player2Score;
    const myscore = splitArray[0] === socket.username ? message.player1Score : message.player2Score;
    const game_stat: MatchForm = {
      my_nickname: socket.username,
      op_nickname: splitArray[0] === socket.username ? splitArray[1] : splitArray[0],
      my_score: splitArray[0] === socket.username ? message.player1Score : message.player2Score,
      op_score: message.player1Score === myscore ? message.player2Score : message.player1Score,
      win: winner === myscore ? true : false,
    }

    const roomInfo = this.server.sockets.adapter.rooms.get(payload.rooms_name);
    if (roomInfo) {
      const roomSocketIds = Array.from(roomInfo.keys());
      const targetSocketId = socket.id;
      const isSocketInRoom = roomSocketIds.find(socketId => socketId === targetSocketId);
      if (isSocketInRoom) {
        if (game_stat.my_score === 11 || game_stat.op_score === 11) {
          await this.instance.AddMatch(game_stat);
        }
      }
      socket.leave(payload.rooms_name);
      await this.sessionStore.SessionStatus(socket.username, "online");
      this.list_room = this.list_room.filter(item => item !== payload.rooms_name);
      const check = this.list_room.find((item) => item === payload.rooms_name);
      const splitArray = payload.rooms_name.split("_");
      const player1 = await this.sessionStore.findNickname(splitArray[0]);
      const player2 = await this.sessionStore.findNickname(splitArray[1]);
      const CrashPlayer = player1.connected === "ingame" ? player1 : player2;
      const matchingSockets = await this.server.in(CrashPlayer.userId).fetchSockets();
      const isDisconnected = matchingSockets.length === 0;
      if (!isDisconnected) {
        this.sessionStore.SessionStatus(CrashPlayer.username, "online");
      }
      // await this.sendStatus(socket);
      await this.handleConnection(socket);
    }
  }


  @SubscribeMessage("kill")
  async handleKill(socket: CustomSocket, room_name: string, path: string) {
    const room = this.server.sockets.adapter.rooms.get(room_name);
    if (room) {
      const roomSocketIds = Array.from(room.keys());
      if (roomSocketIds && roomSocketIds.length === 2) {
        return true;
      }
      else {
        this.server.to(room_name).emit("KILL");
        return false;
      }
    }
  }

  @SubscribeMessage('update-sessions')
  async UpdateSession(socket: CustomSocket) {
    const sessions = await this.sessionStore.findAllSessions();
    if (sessions) {
      this.server.emit('users', sessions);
    }
  }

  @SubscribeMessage('my-info')
  async UpdateMyInfo(socket: CustomSocket) {
    const me = await this.sessionStore.findNickname(socket.username);
    if (me) {
      this.server.to(socket.userId).emit('session', {
        user_info: me,
        block: me.user.blacklist,
        stalk: me.user.blocklist,
      });
      // socket.emit('session', {
      //   user_info: me,
      //   block: me.user.blacklist,
      //   stalk: me.user.blocklist,
      // });
    }
  }

  @SubscribeMessage('channels')
  async sendListChan(socket: CustomSocket) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    const channels_list = await this.service.FindAllChannel();
    if (channels_list)
      this.server.emit("rooms_list", channels_list);
  }

  @SubscribeMessage('block')
  async areyoubloqued(socket: CustomSocket, user: string) {
    const blocked = await this.sessionStore.findNickname(user);
    if (blocked) {
      this.server.to(blocked.userId).emit("blocklist", {
        block: blocked.user.blacklist,
        stalk: blocked.user.blocklist,
      });
    }
  }

  @SubscribeMessage('stalk')
  async areyoustalker(socket: CustomSocket, user: string) {
    let check = await this.use(socket);
    if (check === StatusConnection.ERROR)
      return;
    const me = await this.sessionStore.findNickname(socket.username);
  }
}


