import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { HealthController } from './health.controller';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5433),
        username: configService.get<string>('POSTGRES_USER', 'authkit_user'),
        password: configService.get<string>(
          'POSTGRES_PASSWORD',
          'authkit_pass_123',
        ),
        database: configService.get<string>('POSTGRES_DB', 'authkit'),
        entities: [User],
        synchronize: false,
      }),
    }),
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
