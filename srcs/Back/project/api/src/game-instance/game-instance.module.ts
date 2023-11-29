import { Module } from '@nestjs/common';
import { PrismaManagerModule } from 'src/prisma_manager/prisma_manager.module';
import { GameService } from './game.service';
import { GameController } from './game.controller';

@Module({
    imports: [PrismaManagerModule],
    providers: [GameService],
    controllers: [GameController]
})
export class GameInstanceModule {}

