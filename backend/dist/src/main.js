"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
const cookieParser = require('cookie-parser');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
    }));
    app.use(cookieParser());
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.FRONTEND_URL,
        'https://femcare-frontend-app.onrender.com',
        'https://femcare-frontend.onrender.com',
        'https://femcare-clinic.vercel.app',
    ].filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin))
                return callback(null, true);
            if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
                return callback(null, true);
            }
            if (origin.endsWith('.onrender.com'))
                return callback(null, true);
            callback(new Error(`CORS: Origin ${origin} not allowed`));
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-tenant-id', 'x-csrf-token'],
        credentials: true,
    });
    app.setGlobalPrefix('api', { exclude: ['/', '/health'] });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('FemCare API')
            .setDescription('Gynecology & Obstetrics Clinic Management SaaS Platform')
            .setVersion('2.0')
            .addBearerAuth()
            .addCookieAuth('access_token')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('docs', app, document);
    }
    const port = process.env.PORT ?? 10000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 FemCare API running on port ${port} [${process.env.NODE_ENV || 'development'}]`);
}
bootstrap();
//# sourceMappingURL=main.js.map