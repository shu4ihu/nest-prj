import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '@app/shared';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch {
      return this.getStatus(key, false);
    }
  }
}
