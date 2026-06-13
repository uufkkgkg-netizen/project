import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS – allow all localhost origins (dev) and production domain
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-tenant-id'],
    credentials: true,
  });

  // Set Global Prefix but exclude root for health checks
  app.setGlobalPrefix('api', { exclude: ['/', '/api'] });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('FemCare API')
    .setDescription('The Medical SaaS Platform API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

 await app.listen(process.env.PORT ?? 10000, '0.0.0.0');


}
bootstrap();
