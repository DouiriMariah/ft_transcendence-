import { Controller, Post, Get, Body, Put } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameInstanceDto } from "src/auth/dto";

@Controller('game')
export class GameController{
    constructor(private game_service: GameService){}

    @Post('over')
    create_data(@Body() dto: GameInstanceDto)
    {
        return(this.game_service);
    }

    @Put('over')
    update_data()
    {
        return(this.game_service);
    }

    @Get('my_profile')
    get_data()
    {
        return(this.game_service);
    }
}