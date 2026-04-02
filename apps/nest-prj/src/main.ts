import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalExceptionFilter, TransformInterceptor } from '@app/shared';
import { JwtAuthGuard } from '../../auth/src/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/src/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalGuards(app.get(JwtAuthGuard), app.get(RolesGuard));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Nest Prj API')
    .setDescription('API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  Logger.log('Starting server...');
  await app.listen(process.env.PORT ?? 3000);
  Logger.verbose(`Server is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
