import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard/jwt-auth.guard';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from 'src/schemas/chat.schema';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createChat(
    @Body() createChatDto: CreateChatDto,
    @Request() req: any,
  ): Promise<Chat> {
    return this.chatService.createChat(createChatDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getChats(@Request() req: any): Promise<any[]> {
    return this.chatService.getChats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':chatId')
  async getChatDetails(@Param('chatId') chatId: string): Promise<Chat> {
    return this.chatService.getChatDetails(chatId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':chatId/messages')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Request() req: any,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<Chat> {
    return this.chatService.addMessage(chatId, req.user.id, sendMessageDto);
  }
}
