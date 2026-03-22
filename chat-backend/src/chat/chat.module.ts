import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { Chat, ChatSchema } from 'src/schemas/chat.schema';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    DatabaseModule,
    AuthModule,
  ],
})
export class ChatModule {}
