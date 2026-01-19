import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoUrl =
          configService.get<string>('MONGODB_URL') ||
          'mongodb://localhost:27017/nestjs_db';
        return {
          uri: mongoUrl,
          autoIndex: true,
          serverSelectionTimeoutMS: 5000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [PrismaService],
  exports: [PrismaService, MongooseModule],
})
export class DatabaseModule {}
