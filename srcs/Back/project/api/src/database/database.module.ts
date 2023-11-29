import { Global, Module } from "@nestjs/common";
import { GameInstanceModule } from "src/game-instance/game-instance.module";
import { GameService } from "src/game-instance/game.service";
import { DataService } from "./database.service";
import { DataController } from "./database.controller";
import { SessionStore } from "src/chat/storage.service";

@Global()
@Module({
    // imports : [GameInstanceModule],
    // providers : [DataService],
    // controllers: [DataController]
    providers: [DataService, SessionStore],
    exports: [DataService]
})
export class DataModule{}