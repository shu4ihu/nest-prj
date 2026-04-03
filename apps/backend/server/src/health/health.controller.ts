import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '@app/auth/decorators/public.decorator';
import { PrismaHealthIndicator } from './prisma.health';

@Controller('health')
@Public()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.prisma.isHealthy('database')]);
  }
}
