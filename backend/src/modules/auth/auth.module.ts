import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../core/auth/strategies/jwt.strategy';

// PRE-5 / CAUSE-4: Fail-closed JWT_SECRET validation
// If JWT_SECRET is missing OR shorter than 32 characters, the process must exit immediately.
// A missing/weak secret is WORSE than a crash — attackers can forge tokens silently.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    console.error('FATAL: JWT_SECRET is missing or shorter than 32 characters. Exiting with code 1.');
    process.exit(1);
  }
  return secret;
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: '15m' }, // Short-lived: 15 min access token
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
