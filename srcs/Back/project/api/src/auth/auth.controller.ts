import { Controller, Post, Get, Body, Req, Res, UseGuards, Delete, Param, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { GetUser } from './decorator';
import { Response, Request } from 'express';
import { response } from 'pactum';
import { TwoFactorAuthenticationService } from './a2f.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DataService } from 'src/database/database.service';
import '../sharedTypes';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService,
        private a2fService: TwoFactorAuthenticationService,
        private config: ConfigService, private db: DataService) { }

    @Get('signin')
    signin(@Body() dto: AuthDto, @Res() res: Response) {
        return (this.authService.signin(dto, res));
    }

    @Post('signup')
    signup(@Body() dto: AuthDto, @Res() res: Response) {
        return (this.authService.signup(dto, res));
    }

    @Get('/42')
    async login42(@Req() req: Request, @Res() res: Response) {
        const a = await this.config.get('CLIENT_ID');
        const c = await this.config.get('CALLBACK_URL');

        res.redirect(`https://api.intra.42.fr/oauth/authorize?client_id=${a}&redirect_uri=${c}&response_type=code`)
    }

    @Get('42/callback')
    async connect_to_42(@Req() req: Request, @Res() res: Response) {
        const response = await axios.post('https://api.intra.42.fr/oauth/token', {
            client_id: await this.config.get('CLIENT_ID'),
            client_secret: await this.config.get('CLIENT_SECRET'),
            grant_type: "authorization_code",
            code: req.query.code,
            redirect_uri: await this.config.get('CALLBACK_URL'),
        });
        const accessToken = response.data.access_token;
        const userResponse = await axios.get('https://api.intra.42.fr/v2/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const dto: AuthDto = new AuthDto();
        dto.email = userResponse.data.email;
        dto.nickname = userResponse.data.login;
        this.authService.isUserLoggedIn(dto, res);
    }

    @Post('ga2f')
    async TwofactorAuthentication(@GetUser() user: ft_User, @Res() res: Response) {
        const secret = await this.a2fService.generateSecretKey(user);
        const qrCodeDataUrl = await this.a2fService.generateQrCode(user.nickname, secret);
        return qrCodeDataUrl;
    }

    @Post('log-a2f')
    async LogWithA2f(@GetUser() user: ft_User, @Body() body: ft_Info) {
        const password_user = await this.a2fService.checkUser(user.email)
        if (!password_user)
            return "You have to generate a password first"
        return await this.a2fService.verifyOtp(password_user, body.otp);
    }

    @Delete('no-a2f')
    async DeleteA2f(@GetUser() user: ft_User) {
        return await this.a2fService.deleteA2f(user.nickname);
    }

    @Post('set-nickname') //good
    async sign_nickname(@Res() res: Response, @Body() info: ft_User, @GetUser() data: ft_User) {
        const user = await this.authService.createNickname(info.nickname, data.email);
        if (info.avatar)
            await this.authService.createAvatar(data.email, info.avatar);
        await this.authService.updateToken({ nickname: info.nickname, email: data.email }, res)
        return user
    }


    @Get('security')
    async handleConnection(@GetUser() user: ft_User, @Res() res: Response) {
        try {
            const logged = await this.db.GetByMail(user.email);
            if (logged) {
                return logged;
            } else
                return false;
        }
        catch {
            return false;
        }
    }

    @Get('logout')
    async disconnectFromApp(@GetUser() data: ft_User, @Req() req: Request, @Res() res: Response) {
        await this.authService.logoutAll(data.email, res);
    }
}
