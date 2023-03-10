import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { BadRequestExceptionFilter } from './common/exception/badRequestExceptionFilter';
import { BadRequestExceptionValidation } from './common/exception/badRequestExceptionValidation';
import { QueryFailedErrorException } from './common/exception/queryFailledErrorException';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      enableDebugMessages: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestExceptionValidation(validationErrors);
      }
    })
  );
  app.useGlobalFilters(new BadRequestExceptionFilter(), new QueryFailedErrorException());

  const config = new DocumentBuilder()
    .setTitle('Buddies Corner API')
    .setDescription('Buddies Corner API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
