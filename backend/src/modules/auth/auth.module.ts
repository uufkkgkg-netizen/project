import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../core/auth/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: (() => {
        if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
          console.error('CRITICAL WARNING: JWT_SECRET environment variable is missing in production. Using insecure fallback.');
        }
        return process.env.JWT_SECRET || 'dev_secret_fallback_only_change_me_in_prod_12345';
      })(),
      signOptions: { expiresIn: '15m' }, // Token rotation: 15 mins for access token
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
