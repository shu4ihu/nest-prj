import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  Logger.log('Starting server...');
  await app.listen(process.env.PORT ?? 3000);
  Logger.verbose(`Server is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
