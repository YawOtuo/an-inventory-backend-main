import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { InventoryModule } from './inventory/inventory.module';
import { ItemsModule } from './items/items.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { ShopsModule } from './shops/shops.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret || secret.trim() === '') {
          throw new Error('JWT_SECRET must be set in environment variables and cannot be empty');
        }
        return {
          secret: secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '1h'),
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ShopsModule,
    ItemsModule,
    InventoryModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

