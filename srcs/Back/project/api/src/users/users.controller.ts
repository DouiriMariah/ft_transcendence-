import { Controller, Get, Post, Req, Delete, Res, Body } from "@nestjs/common";
import { GetUser } from "src/auth/decorator";
import { DataService } from "src/database/database.service";
import { Response, Request } from "express";
import { UserService } from "./users.service";
import '../sharedTypes';

@Controller('users')
export class UserController {
    constructor(private data: DataService, private service: UserService) {
    }

    @Post()
    async getMe(@GetUser('nickname') username: string, @Body() info: ft_Info, @Res() res: Response) {
        const data = await this.data.getUser(info.nickname);
        if (data) {
            return data;
        }
        return false;
    }

    @Get('all')
    async getAll(@Req() req: Request, @Res() res: Response) {
        let data = await this.data.getAll();
        let final_rep = await this.service.UsersFilter(data, req.user);
        return final_rep;
    }

    @Post('friends')
    async getFriends(@GetUser('nickname') username: string, @Body() info: ft_Info,) {
        if (info.friendName)
            return await this.data.addNewFriend(username, info.friendName);
        else
            return await this.data.getFriends(username);
    }

    @Post('block')
    getBlockedUser(@GetUser('nickname') username: string, @Body() info: ft_Info,) {
        if (info.blockedUser)
            return this.data.addNewBlockedUser(username, info.blockedUser);
        else
            return this.data.getBlockedUser(username);
    }

    @Delete('deblock')
    async getDeblockUser(@GetUser('nickname') username: string, @Body() info: ft_Info) {
        return await this.data.deleteBlockedUser(username, info.deblockUser);
    }

    @Delete('deletefriend')
    async getDeletefriend(@GetUser('nickname') username: string, @Body() info: ft_Info) {
        await this.data.deleteFriend(username, info.byefriend);
        return await this.data.deleteFriend(info.byefriend, username);
    }

    @Post('invitefriend')
    async handleInviteFriends(@GetUser('nickname') username: string, @Body() info: ft_Info) {
        await this.data.SendInviteFriends(username, info.nickname);
    }
}

