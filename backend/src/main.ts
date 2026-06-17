import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // ── Security Headers (Helmet) ──────────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disable CSP for Swagger UI compatibility
  }));

  // ── Cookie Parser (required for HttpOnly cookie auth) ─────────────────────
  app.use(cookieParser());

  // ── CORS — restrict to known origins only ────────────────────────────────
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
    // Render frontend service URLs
    'https://femcare-frontend-app.onrender.com',
    'https://femcare-frontend.onrender.com',
    'https://femcare-clinic.vercel.app',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, server-side)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In development, allow any localhost
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true);
      }
      // Allow any onrender.com subdomain (for Render preview deployments)
      if (origin.endsWith('.onrender.com')) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-tenant-id', 'x-csrf-token'],
    credentials: true,
  });

  // ── Global Prefix (exclude health route) ──────────────────────────────────
  app.setGlobalPrefix('api', { exclude: ['/', '/health'] });

  // ── Global Validation Pipe ─────────────────────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // ── Swagger (disabled in production) ──────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('FemCare API')
      .setDescription('Gynecology & Obstetrics Clinic Management SaaS Platform')
      .setVersion('2.0')
      .addBearerAuth()
      .addCookieAuth('access_token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT ?? 10000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 FemCare API running on port ${port} [${process.env.NODE_ENV || 'development'}]`);
}

bootstrap();
