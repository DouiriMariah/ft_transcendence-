import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { DataModule } from 'src/database/database.module';
import { UserService } from './users.service';




@Module({
  imports : [DataModule], //Pour utiliser l'entity User
  providers: [UserService],
  controllers: [UserController]
})
export class UsersModule {}

