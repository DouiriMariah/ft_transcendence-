import { ForbiddenException, Injectable, Res, Req, HttpStatus } from '@nestjs/common';
import { PrismaManagerService } from 'src/prisma_manager/prisma_manager.service';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { DataService } from 'src/database/database.service';

@Injectable()
export class AuthService {
    constructor(private config: ConfigService,
        private prisma: PrismaManagerService, private jwt: JwtService,
        private db: DataService) { }

    async updateToken(dto: ft_User, res: Response) {
        const refresh_token = await this.signToken(dto.nickname, dto.email, "2w", "Refresh_Token", 'JWT_REFRESH_SECRET', res)
        const hash = await argon2.hash(refresh_token);
        const updatedUser = await this.prisma.user.update({
            where: { email: dto.email },
            data: {
                refreshtoken: hash,
                status: "online",
            },
            select: {
                email: true,
                login: true,
                nickname: true,
                password_A2f: true
            },
        });
        const access_token = await this.signToken(dto.nickname, dto.email, "3h", "Access_token", 'JWT_SECRET', res);
        await this.sendCookie(res, 'refreshToken', refresh_token);
        await this.sendCookie(res, 'accessToken', access_token);
        return updatedUser;
    }


    async signin(dto: ft_User, res: Response) {
        let updatedUser = await this.updateToken(dto, res);
        if (updatedUser.password_A2f) {
            const final = "http://" + process.env.POST_LOCAL + ":" + process.env.PORT_FRONT + "/a2f";
            res.redirect(final);
        } else {
            let final = "http://" + process.env.POST_LOCAL + ":" + process.env.PORT_FRONT + "/home";
            if (!updatedUser.nickname) {
                final = "http://" + process.env.POST_LOCAL + ":" + process.env.PORT_FRONT + "/register";
            }
            res.redirect(final);
        }
    }

    //create user
    async signup(dto: ft_User, res: Response) {
        try {
            const refresh_token = await this.signToken(dto.nickname, dto.email, "2w", "Refresh_Token", 'JWT_REFRESH_SECRET', res)
            const hash = await argon2.hash(refresh_token);
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    login: dto.nickname,
                    refreshtoken: hash,
                    status: "online",
                },
            });
            const access_token = await this.signToken(dto.nickname, dto.email, "3h", "Access_token", 'JWT_SECRET', res);
            await this.sendCookie(res, 'refreshToken', refresh_token);
            await this.sendCookie(res, 'accessToken', access_token);
            const final = "http://" + process.env.POST_LOCAL + ":" + process.env.PORT_FRONT + "/register";
            res.redirect(final);
        }
        catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken',);
                }
            }
            throw error;
        }
    }

    //Problem Cookie and Insomnia
    async signToken(nickname: string, email: string, time: string, token_type: string, secret: string, res: Response): Promise<string> //extract by the jwt
    {
        const payload = { nickname, email }; //convention unique identify
        const token_secret = await this.config.get(secret) //jwt_secret is a key available in .env 
        const token = await this.jwt.signAsync(payload,
            {
                expiresIn: time, //after that you have to signin again
                secret: token_secret,
            });
        return token;
    }

    async isUserLoggedIn(info: ft_User, @Res() res: Response) {
        let user = await this.prisma.user.findUnique({
            where: {
                email: info.email,
            },
        });
        if (!user)
            return await this.signup(info, res);
        else {
            info.nickname = user.nickname;
            return await this.signin(info, res);
        }
    }

    async createNickname(newnickname: string, usermail: string) //bon
    {
        let old_nickname = newnickname;
        const me = await this.prisma.user.findUnique({
            where: { email: usermail }
        });
        if (me.nickname)
            old_nickname = me.nickname;
        const check = await this.prisma.session.findUnique({
            where: {
                username: old_nickname,
            },
        });
        if (check) {
            try {

                const user = await this.prisma.user.update({
                    where: {
                        email: usermail,
                    },
                    data: {
                        nickname: newnickname,
                        session_list: {
                            connect: {
                                username: newnickname,
                            }
                        }
                    },
                });
                if (user) {
                    await this.db.ChangeNicknameEverywhere(old_nickname, newnickname, usermail);
                    return user;
                }
            }
            catch {
                return false;
            }
        }
        else {
            try {

                const user = await this.prisma.user.update({
                    where: {
                        email: usermail,
                    },
                    data: {
                        nickname: newnickname,
                    }
                });
                if (user) {
                    await this.db.ChangeNicknameEverywhere(old_nickname, newnickname, usermail);
                    return user;
                }
            }
            catch {
                return false;
            }
        }
    }

    async createAvatar(usermail: string, avatar: string) {
        const user = await this.prisma.user.update({
            where: {
                email: usermail,
            },
            data: {
                avatar: avatar,
            },
        });
        if (user)
            return user;
    }

    async verifyRefreshToken(data: ft_Info, user: ft_User, res: Response) {
        const user_log = await this.prisma.user.findUnique({
            where: {
                email: user.email,
            },
            select: {
                refreshtoken: true,
            }
        });
        if (user_log.refreshtoken) {
            let test = await argon2.verify(user_log.refreshtoken, data.refreshToken);
            if (test) {
                const access_token = await this.signToken(user.nickname, user.email, "3h", "access_token", 'JWT_SECRET', res);
                await this.sendCookie(res, 'accessToken', access_token);
                await this.sendCookie(res, 'refreshToken', data.refreshToken);
                return true;
            }
        }
        await this.logoutAll(user.email, res);
    }


    async logoutAll(mail: string, res: Response) {
        let user = await this.prisma.user.update({
            where: {
                email: mail,
            },
            data: {
                refreshtoken: null,
                status: "offline",
            },
        })
        this.deleteCookies(res, 'accessToken', "");
        this.deleteCookies(res, 'refreshToken', "");
    }

    async sendCookie(res: Response, key: string, value: string) {
        res.cookie(key, value, {
            httpOnly: false,
            maxAge: 14 * 24 * 60 * 60 * 1000,
        })
    }

    async deleteCookies(res: Response, key: string, value: string) {
        res.cookie(key, value, {
            httpOnly: false,
            maxAge: 1,
        })
    }

    async checkToken(token: string) {
        const final = await this.jwt.verify(token);

    }
}
