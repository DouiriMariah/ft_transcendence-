import { Injectable } from "@nestjs/common";
import { GroupChat, MessageForm } from "src/interface/success-response.interface";
import { PrismaManagerService } from "src/prisma_manager/prisma_manager.service";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaManagerService) { }
  async FindAllChannel() {
    const Channels = await this.prisma.chat.findMany({
      where: {
        NOT: {
          type: "dm",
        },
      },
      select: {
        chat_name: true,
        id: true,
        type: true,
        protected: true,
      }
    });
    if (!Channels)
      return false;
    return Channels.map((chat) => chat);
  }

  async FindDm(friend: string, me: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        type: "dm",
        AND: [
          {
            users: {
              some: {
                username: me,
              }
            }
          },
          {
            users: {
              some: {
                username: friend,
              }
            }
          }
        ]
      },
      select: {
        chat_name: true,
        message: true,
        users: {
          include: {
            user: {
              select: {
                avatar: true,
              },
            },
          },
        },
      }
    });
    if (chat) {
      return chat;
    }
  }

  async FindAllDm(me: string) {
    const Channels = await this.prisma.session.findMany({
      where: {
        username: me,
        chats: {
          some: {
            type: "dm",
          }
        }
      },
      select: {
        username: true,
        userId: true,
        connected: true,
        chats: {
          select: {
            chat_name: true,
            message: true,
            type: true,
            users: true,
          },
          where: {
            type: "dm"
          }
        }
      }
    });
    if (!Channels)
      return false;
    return Channels.map((chat) => chat);
  }

  async FindChannel(name_chat: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: name_chat },
      select: {
        id: true,
        chat_name: true,
        type: true,
        owner_group_chat: true,
        protected: true,
        users: true,
        admins: true,
        muted: true,
        banned: true,
        message: true,
      }
    });
    if (chat) {
      return chat;
    }
    else
      return null;
  }


  async FindChat(name_chat: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { chat_name: name_chat },
      include: {
        users: true,
        admins: true,
        muted: true,
        banned: true,
        message: true,
      }
    });
    if (chat) {
      return chat;
    }
    else
      return null;
  }

  async AlreadyInTheCHat(username: string, name_chat: string) {
    const chat = await this.FindChat(name_chat);
    if (!chat)
      return null;
    const adminSession = chat.users.some((user) => user.username === username)
    if (adminSession) {
      return true;
    }
    return false;
  }

  async BannedOne(username: string, chat_id: number) {
    const chat = await this.FindChannel(chat_id);
    if (chat) {
      const adminSession = chat.banned.some((user) => user.username === username)
      if (adminSession) {
        return true;
      }
    }
    return false;
  }

  async CreateChat(newchat: GroupChat) {
    const check = await this.FindChat(newchat.name_chat);
    if (check) {
      return false;
    }
    const new_chat = await this.prisma.chat.create({
      data: {
        chat_name: newchat.name_chat,
        type: newchat.type,
        protected: newchat.protected,
        maxUsers: newchat.maxUsers,
        owner_group_chat: newchat.owner_group_chat,
      },
    });
    if (new_chat) {
      await this.AddUserToChat(newchat.owner_group_chat, newchat.name_chat);
      return new_chat;
    }
  }

  async AddUserToChat(username: string, name_chat: string) {
    const Session = await this.AlreadyInTheCHat(username, name_chat);
    if (Session === null)
      return null;
    else if (Session)
      return ;
    else {
      const users = await this.prisma.chat.update({
        where: { chat_name: name_chat },
        data: {
          users: {
            connect: { username: username },
          },
        },
      });
      if (users) {
        return users;
      }
    }

  }

  async AddUserToChatId(username: string, chat_id: number) {
    const chat = await this.FindChannel(chat_id);
    if (chat) {
      const Session = await this.AlreadyInTheCHat(username, chat.chat_name);
      if (Session === null)
        return null;
      else if (Session)
        return ;
      else {
        const users = await this.prisma.chat.update({
          where: { chat_name: chat.chat_name },
          data: {
            users: {
              connect: { username: username },
            },
          },
        });
        if (users) {
          return users;
        }
      }
    }

  }

  async AddMessageToChat(msg: MessageForm) {
    const messages = await this.prisma.message.create({
      data: {
        name_chat: msg.name_chat,
        from: msg.from,
        from_id: msg.from_id,
        to: msg.to,
        to_id: msg.to_id,
        content: msg.content,
      },
      select: {
        my_chat: true,
      },

    })
    if (messages) {
      if (messages.my_chat.type === "dm") {
        await this.AddUserToChat(msg.from, msg.name_chat);
        await this.AddUserToChat(msg.to, msg.name_chat);
      }
      return messages;
    }
  }


  async AdminUsers(admin_name: string, name_chat: string) {
    const check = await this.AlreadyInTheCHat(admin_name, name_chat);
    if (check) {
      const admin = await this.prisma.chat.update({
        where: { chat_name: name_chat },
        data: {
          admins: {
            connect: { username: admin_name },
          },
        },
      });
      if (admin)
        return admin;
    }
    return check;

  }

  async BannedUsers(admin_name: string, name_chat: string) {
    const check = await this.AlreadyInTheCHat(admin_name, name_chat);
    if (check) {
      const admin = await this.prisma.chat.update({
        where: { chat_name: name_chat },
        data: {
          banned: {
            connect: { username: admin_name },
          },
        },
      });
      if (admin) {
        await this.DeleteUser(admin_name, name_chat);
        return admin;
      }
    }
    else {
      return false;
    }
    return check;
  }


  async MutedUsers(admin_name: string, name_chat: string) {
    const check = await this.AlreadyInTheCHat(admin_name, name_chat);
    if (check) {
      const admin = await this.prisma.chat.update({
        where: { chat_name: name_chat },
        data: {
          muted: {
            connect: { username: admin_name },
          },
        },
      });
      if (admin)
        return admin;
    }
    return check;
  }

  async DeleteUser(username: string, name_chat: string) {
    const Session = await this.AlreadyInTheCHat(username, name_chat);
    if (!Session)
      return null;
    const users = await this.prisma.chat.update({
      where: { chat_name: name_chat },
      data: {
        users: {
          disconnect: { username: username },
        },
        admins: {
          disconnect: { username: username },
        },
        muted: {
          disconnect: { username: username },
        },
      },
    });
    if (users) {
      if (username === users.owner_group_chat) {
        const channel = await this.prisma.chat.update({
          where: { chat_name: name_chat },
          data: {
            owner_group_chat: null,
          },
        });
        return channel;
      }
      return users;
    }

  }

  async UnbannedUser(username: string, name_chat: string) {
    const users = await this.prisma.chat.update({
      where: { chat_name: name_chat },
      data: {
        banned: {
          disconnect: { username: username },
        },
      },
    });
    if (users) {
      return users;
    }
  }

  async UnMuteUser(username: string, name_chat: string) {
    const users = await this.prisma.chat.update({
      where: { chat_name: name_chat },
      data: {
        muted: {
          disconnect: { username: username },
        },
      },
    });
    if (users)
      return users;
  }

  async ChangePassword(pwd: any, name_chat: string) {
    const chani = await this.prisma.chat.findFirst({
      where: {
        chat_name: name_chat,
      },
      include: {
        users: true,
        admins: true,
        muted: true,
        banned: true,
      }
    });
    if (chani) {
      const chan = await this.prisma.chat.update({
        where: {
          chat_name: chani.chat_name,
        },
        data: {
          protected: pwd,
        },
      });
      if (chan)
        return chan;
    }
  }

  async DeletePassword(name_chat: string) {
    const chani = await this.prisma.chat.findFirst({
      where: {
        chat_name: name_chat,
      }
    });
    const chan = await this.prisma.chat.update({
      where: { chat_name: chani.chat_name },
      data: {
        protected: null,
      },
    });
    if (chan)
      return chan;
  }
}
