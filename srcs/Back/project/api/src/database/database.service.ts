import { Injectable } from "@nestjs/common";
import { PrismaManagerService } from "src/prisma_manager/prisma_manager.service";


@Injectable()
export class DataService{
    constructor(private prisma: PrismaManagerService,){}
    async getAll()
    {
      const usersAsc = await this.prisma.user.findMany({});
      return usersAsc.map((user) => user);//ATTENTIOn
    }

    async GetByMail(mail: string)
    {
      let user = await this.prisma.user.findUnique({
        where: {
          email: mail,
        }
      });
      if(user)
        return user;
      return false;
    }

    async getUser(username: string)
    {
      try{
        let user = await this.prisma.user.findUnique({
            where : {
                nickname: username,
            },
            include: {
              friends: true,
              friendships:true,
              blocklist: true,
              blacklist:true,
              invits_received: true,
              my_invits: true,
              statistic: {
                include: {
                  player_history: true,
                }
              },
            },
        });
        if(user)
            return user;
      }
      catch{
      }
    }


    async SendInviteFriends(username: string, new_friend: string)
    {
      const myfriend = await this.getFriends(username);
      if(myfriend)
      {
        // console.log("on va verifier = " + myfriend)
        const check = myfriend.find((user) => user.friendId === new_friend);
        if(check)
        {
          // console.log("On est deja ami");
          return false;
        }
      }
      const existingInvitation = await this.prisma.invitation.findFirst({
        where: {
          from: username,
          to: new_friend,
        },
      });
      if(existingInvitation)
        return false;
      const user = await this.prisma.invitation.create({
        data: {
          username: username,
          from: username, 
          to: new_friend,
          inv_sent: {
            connect: { nickname: username },
          },
          inv_received: {
            connect: { nickname: new_friend},
          }
        }
      });
      if(user)
        return true;
      else
        return false;
    }

    async getFriends(username: string)
    {
        const user = await this.getUser(username);
        if(!user.friends.length)
            return null;
        return user.friends;
    }

    async getBlockedUser(username: string)
    {
        const user = await this.getUser(username);
        if(!user.blacklist.length)
              return null
        return user.blacklist;
    }
    
    async DeleteInvite(username: string, newFriend: string)
    {
      const deletedInvitations = await this.prisma.invitation.deleteMany({
        where: {
          OR: [
            { from: username, to: newFriend },
            { from: newFriend, to: username },
          ],
        },
      });
    }


    async addNewFriend(username: string, friend: string)
    {
        const user = await this.getUser(username);
        const bff = await this.getUser(friend);

        let already_friends = await this.prisma.friends.findFirst({
          where : {
              userId: user.nickname,
              friendId: bff.nickname,
          },
        });
        const already_blocked = await this.prisma.blockedUsers.findFirst({
          where:{
            userId: bff.nickname,
            blockerId: user.nickname,
          },
        })
        if(already_friends || already_blocked)
          return;
          //USer list create
        await this.prisma.friends.create({
          data: {
            userId: user.nickname,
            friendId: bff.nickname,
          },
        });
        //Friend list create
        await this.prisma.friends.create({
          data: {
            userId: bff.nickname,
            friendId: user.nickname,
          },
        });
        await this.DeleteInvite(username, friend);
  };

    async addNewBlockedUser(username: string, blocked: string)
    {
        const user = await this.getUser(username);
        const blk = await this.getUser(blocked);

        const already_blocked = await this.prisma.blockedUsers.findFirst({
          where:{
            userId: user.nickname,
            blockerId: blk.nickname,
          },
        })
        if(!already_blocked)
        {
          const the_blocker = await this.prisma.blockedUsers.create({
            data: {
              userId: user.nickname,
              blockerId: blk.nickname,
            },
          });
          this.getBlockedUser(username);
          this.deleteFriend(username, blocked);
          this.deleteFriend(blocked, username);
        }
    }

    async deleteFriend(username: string, byefriend: string)
    {
      let already_friends = await this.prisma.friends.findFirst({
        where : {
            userId: username,
            friendId: byefriend,
        },
      });
      if(already_friends)
      {

        await this.prisma.friends.delete({
          where: {
            userId_friendId:{
              userId: username,
              friendId: byefriend,
            },
          },
        });
      }

    }

    async deleteBlockedUser(username: string, blockedUser: string)
    {
      const already_blocked = await this.prisma.blockedUsers.findFirst({
        where:{
          userId: username,
          blockerId: blockedUser,
        },
      })
      if(!already_blocked)
        return;
      const bon = await this.prisma.blockedUsers.delete({
        where: {
          userId_blockerId:{
            userId: username,
            blockerId: blockedUser,
          },
        },
      })
    }

    async UpdateStatus(newstatus: string, id: string)
    {
      const the_user = await this.prisma.user.findFirst({
        where: { nickname: id},
      })
      if(!the_user)
        return;
      const user = await this.prisma.user.update({
        where: { email: the_user.email,},
        data: {
          status: newstatus,
        },
      });
    }

    async ChangeNicknameEverywhere(old_nickname:string, newnickname: string, email: string)
    {
      await this.prisma.gameInstance.updateMany({
        where: {
          user_nickname: old_nickname,
        },
        data: {
          user_nickname: newnickname,
        }
      });

      await this.prisma.match_History.updateMany({
        where: {
              player_nickname: old_nickname,
        },
        data: {
          player_nickname: newnickname,
        }
      });

      await this.prisma.match_History.updateMany({
        where: {
              opponent_nickname: old_nickname,
        },
        data: {
          opponent_nickname: newnickname,
        }
      });

      await this.prisma.friends.updateMany({
        where: {
          userId: old_nickname,
        },
        data: {
          userId: newnickname,
        }
      });

      await this.prisma.friends.updateMany({
        where: {
          friendId: old_nickname,
        },
        data: {
          friendId: newnickname,
        }
      });


      await this.prisma.blockedUsers.updateMany({
        where: {
          userId: old_nickname,
        },
        data: {
          userId: newnickname,
        }
      });
      
      await this.prisma.blockedUsers.updateMany({
        where: {
          blockerId: old_nickname,
        },
        data: {
          blockerId: newnickname,
        }
      });

      await this.prisma.invitation.updateMany({
        where: {
          OR: [
            { username: old_nickname, },
            { from: old_nickname, },
            { to: old_nickname, }
          ]
        },
        data: {
          username: newnickname,
          from: newnickname,
          to: newnickname,
        }
      });

      await this.prisma.message.updateMany({
        where: {
          from_id: old_nickname,
        },
        data: {
          from_id: newnickname,
        }
      });

      await this.prisma.message.updateMany({
        where: {
          to: old_nickname,
        },
        data: {
          to: newnickname,
        }
      });

      await this.prisma.chat.updateMany({
        where:{
          owner_group_chat: old_nickname,
        },
        data: {
          owner_group_chat: newnickname,
        }
      })
      const dms = await this.prisma.chat.findMany({
        where: {
          type : "dm",
        }
      });
      if(dms)
      {
        dms.forEach(async(dm) => {
          const splitted = dm.chat_name.split("_dm_");
          const index = splitted.findIndex(item => item === old_nickname);
          if(index !== -1)
          {
            let name_dm = index === 0 ? (
              newnickname + "_dm_" + splitted[1]
            ) : (splitted[0] + "_dm_" + newnickname);
            await this.prisma.chat.update({
              where: {
                chat_name: dm.chat_name,
              },
              data: {
                chat_name: name_dm,
              },
            });
          }
        })
      }
    }
}
