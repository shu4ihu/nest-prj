import { Module, Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`${process.cwd()}/.env`],
    }),
  ],
  providers: [SharedService, PrismaService],
  exports: [SharedService, PrismaService],
})
export class SharedModule {}
