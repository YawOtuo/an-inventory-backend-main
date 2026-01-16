import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PasswordUtil } from '../common/utils/password.util';
import { JwtUtil } from '../common/utils/jwt.util';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordUtil, JwtUtil],
  exports: [AuthService],
})
export class AuthModule {}

