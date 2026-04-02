import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import { AuthModule } from '../../auth/src/auth.module';
import { UserModule } from '../../user/src/user.module';
import { PermissionModule } from '../../permission/src/permission.module';
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
