import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PlacesModule } from './places/places.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(
          configService.get<string>('POSTGRES_PORT') ?? '5433',
        ),

        username:
          configService.getOrThrow<string>('POSTGRES_USER'),

        password:
          configService.getOrThrow<string>('POSTGRES_PASSWORD'),

        database:
          configService.getOrThrow<string>('POSTGRES_DB'),

        autoLoadEntities: true,
        synchronize: false,
        logging: false,
      }),
    }),

    UsersModule,

    AuthModule,

    PlacesModule,
  ],

  controllers: [AppController],
  providers: [],
})
export class AppModule {}