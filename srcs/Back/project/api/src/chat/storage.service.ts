import { PrismaManagerService } from "src/prisma_manager/prisma_manager.service";
import { Injectable } from "@nestjs/common";
import { SessionDto } from "src/auth/dto";
import { DataService } from "src/database/database.service";

@Injectable()
export class SessionStore {
  constructor(private prisma: PrismaManagerService, private db: DataService) {
  }

  async findNickname(name: string) {
    const user = await this.prisma.session.findFirst({
      where: {
        username: name,
      },
      include:
      {
        user: {
          select: {
            blacklist: true,
            blocklist: true,
          },
        },
      },
    });
    return user;
  }

  async findSession(id: string) {
    const user = await this.prisma.session.findUnique({
      where: {
        sessionId: id,
      },
    });
    return user;
  }

  async SessionStatus(id: string, newstatus: string) {
    const user = await this.findNickname(id);
    if (!user)
      return;
    const session = await this.prisma.session.update({
      where: {
        sessionId: user.sessionId,
      },
      data:
      {
        connected: newstatus,
      }
    })
    if (session) {
      await this.db.UpdateStatus(newstatus, id);
      return session;
    }
  }

  async ReelUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        nickname: id,
      }
    });
    if (!user) {
      return false;
    }
    return true;
  }


  async saveSession(id: string, newSession: SessionDto) {
    if (!(await this.ReelUser(id)))
      return false;
    const session = await this.findNickname(id);
    if (session) {
      const status = await this.prisma.session.update({
        where: {
          sessionId: session.sessionId,
        },
        data: {
          userId: newSession.userId,
          sessionId: session.sessionId,
          username: newSession.username,
          connected: newSession.connected,
        },
        include:
        {
          user: {
            select: {
              blacklist: true,
              blocklist: true,
            }
          }
        }

      })
      await this.db.UpdateStatus(newSession.connected, newSession.username);
      return status;
    }
    else {
      // console.log("Session = " + session);
      if(session)
      {
        return await this.db.UpdateStatus(newSession.connected, newSession.username);
      }
      const user = await this.prisma.session.create({
        data: {
          userId: newSession.userId,
          sessionId: newSession.sessionId,
          username: newSession.username,
          connected: newSession.connected,
          for: "chat",
        },
        include:
        {
          user: {
            select: {
              blacklist: true,
              blocklist: true,
            }
          }
        }
      })
      if (user) {
        await this.db.UpdateStatus(newSession.connected, newSession.username);
        return user;
      }
    }
  }

  async findAllSessions() {
    const sessions = await this.prisma.session.findMany({
      include: {
        user: {
          select: {
            avatar: true,
          }
        }
      }
    });
    if (!sessions) {
      return false;
    }
    return sessions.map((user) => user);
  }
}

@Injectable()
export class MessageStore {
  constructor(private prisma: PrismaManagerService) {

  }

  async saveMessage(msg: ft_Message) {
  }

  async findMessagesForUser(userID: string) {
    const msg = await this.prisma.message.findMany({
      where: {
        OR: [
          { from: userID },
          { to: userID },
        ],
      },
    });
    return msg;
  }
}
