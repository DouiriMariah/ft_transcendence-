import { Body, Injectable } from "@nestjs/common";
// import { GameInstance } from "@prisma/client";
// import { GameInstanceDto, MatchHistoryDto } from "src/auth/dto";
import { PrismaManagerService } from "src/prisma_manager/prisma_manager.service";

@Injectable()
export class GameService{
    constructor(private prisma_data: PrismaManagerService){}

    // async create_data(@Body() dto_instance: GameInstanceDto, @Body() dto_history: MatchHistoryDto)
    // {
    //     if(dto_instance.winner)
    //         dto_instance.win++;
    //     else
    //         dto_instance.losses++;
    //     const new_instance = await this.prisma_data.gameInstance.create({
    //         data: {
    //             win: dto_instance.win,
    //             losses: dto_instance.losses,
                
    //         }
    //     });
    //     const new_history = await this.prisma_data.match_History.create({
    //         data: {

    //         }
    //     })
        
    // }
}