import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    constructor() {
        const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
        super({
            adapter,
            log: [
                { emit: 'event', level: 'query' },
                'info', 'warn', 'error',
            ],
        } as any);
    }

    async onModuleInit() {
        (this as any).$on('query', (e: any) => {
            Logger.debug(`Query: ${e.query}`);
            Logger.debug(`Params: ${e.params}`);
            Logger.debug(`Duration: ${e.duration}ms`);
        });
        await this.$connect();
        Logger.log('Prisma connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        Logger.log('Prisma disconnected');
    }
}
