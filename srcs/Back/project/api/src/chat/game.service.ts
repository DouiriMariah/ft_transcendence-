import { Injectable } from "@nestjs/common";
import { MatchForm } from "src/interface/success-response.interface";
import { PrismaManagerService } from "src/prisma_manager/prisma_manager.service";


@Injectable()
export class GameService {
    constructor(private prisma: PrismaManagerService) { }

    async AddMatch(match: MatchForm) {
        await this.CreateInstance(match.my_nickname);
        const game = await this.prisma.match_History.create({
            data: {
                my_score: match.my_score,
                opponent_score: match.op_score,
                opponent_nickname: match.op_nickname,
                win: match.win,
                player_nickname: match.my_nickname,
            },
        })
        if (game) {
            await this.UpdateInstance(match);
            return game;
        }
        return false;
    }

    async CreateInstance(me: string) {
        const findMe = await this.prisma.gameInstance.findUnique({
            where: {
                user_nickname: me,
            },
        });
        if (!findMe) {
            const instance = await this.prisma.gameInstance.create({
                data: {
                    win: 0,
                    losses: 0,
                    rank: 0,
                    level: 0,
                    achievement: "",
                    user_nickname: me,
                },
                include: {
                    player_history: true,
                }
            })
            if (instance)
                return instance;
        }
        return (findMe);
    }

    async UpdateInstance(match: MatchForm) {
        const old_instance = await this.CreateInstance(match.my_nickname);
        let new_achievement = old_instance.achievement;
        if (old_instance.losses === 0 && match.win === false) {
            new_achievement = new_achievement + "1";
        }
        if (old_instance.win === 0 && match.win === true) {
            new_achievement = new_achievement + "3";
        }
        if ((old_instance.win + old_instance.losses) === 4) {
            new_achievement = new_achievement + "4";
        }
        if (old_instance.win === 4 && match.win === true) {
            new_achievement = new_achievement + "5";
        }
        if (old_instance.losses === 4 && match.win === false) {
            new_achievement = new_achievement + "2";
        }
        const new_win = match.win === true ? (old_instance.win + 1) : old_instance.win;
        const new_losses = match.win === true ? old_instance.losses : (old_instance.losses + 1);
        const new_rank = match.win === true ? (old_instance.rank + 3) : (old_instance.rank - 2);
        const update = await this.prisma.gameInstance.update({
            where: {
                user_nickname: match.my_nickname
            },
            data: {
                win: new_win,
                losses: new_losses,
                achievement: new_achievement,
                rank: new_rank,
            },

        });
        if (update)
            return update;
        return false;
    }

    async FindInstance(username: string) {
        const instance = await this.prisma.gameInstance.findUnique({
            where: {
                user_nickname: username,
            },
            select: {
                player_history: true,
            },
        });
        if (instance) {
            return instance;
        }
        return false;
    }

    async AllGames() {
        const all_games = await this.prisma.gameInstance.findMany({
            include: {
                player_history: true,
            }
        });
        if (all_games) {
            return all_games;
        }
        return false;
    }
}