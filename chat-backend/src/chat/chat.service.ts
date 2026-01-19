import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from 'src/schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private prismaService: PrismaService,
  ) {}

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const participantIds = createChatDto.participants.map((id) =>
      parseInt(id, 10),
    );
    const newChat = new this.chatModel({
      participants: participantIds,
      messages: [],
    });

    return await newChat.save();
  }

  async getChats(userId: number): Promise<any[]> {
    const chats = await this.chatModel
      .find({ participants: userId })
      .lean()
      .exec();
    const allUserIds = new Set<number>();
    chats.forEach((chat) => {
      chat.participants.forEach((id) => allUserIds.add(id));
    });

    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: Array.from(allUserIds),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));

    const chatsWithUserInfo = chats.map((chat) => ({
      ...chat,
      participants: chat.participants.map((id) => ({
        id,
        name: userMap.get(id)?.name || 'Unknown',
        email: userMap.get(id)?.email || '',
      })),
    }));

    console.log('chatsWithUserInfo', chatsWithUserInfo);
    return chatsWithUserInfo;
  }

  async addMessage(
    chatId: string,
    userId: number,
    content: string,
  ): Promise<{ sender: number; content: string; timestamp: Date }> {
    const message = {
      sender: userId,
      content,
      timestamp: new Date(),
    };

    await this.chatModel.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: message },
      },
      { new: true },
    );

    return message;
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    return await this.chatModel.findById(chatId).lean().exec();
  }
}
