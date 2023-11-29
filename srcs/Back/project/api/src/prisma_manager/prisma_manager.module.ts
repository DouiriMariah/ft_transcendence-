import { Module, Global } from '@nestjs/common';
import { PrismaManagerService } from './prisma_manager.service';

@Global()
@Module({
  providers: [PrismaManagerService],
  exports: [PrismaManagerService]
})
export class PrismaManagerModule {}
