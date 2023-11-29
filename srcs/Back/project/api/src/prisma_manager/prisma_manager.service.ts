import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaManagerService extends PrismaClient{
    constructor(config:ConfigService){
        super({
            datasources:{
                db: {
                    url: config.get('DATABASE_URL'), 
                },
            },
        });
    }

    cleanDb(){
        return this.$transaction([
            this.user.deleteMany(),
        ]);
    }
}
