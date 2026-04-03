import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import { AuthModule } from '@app/auth/auth.module';
import { UserModule } from '@app/user/user.module';
import { PermissionModule } from '@app/permission/permission.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    SharedModule,
    UserModule,
    PermissionModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
