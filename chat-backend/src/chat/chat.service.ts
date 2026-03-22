import { SendMessageDto } from './dto/send-message.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
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

  private buildChatTitle(
    participants: { id: number; name: string | null; email: string }[],
  ) {
    const labels = participants.map(
      (participant) => participant.name?.trim() || participant.email,
    );

    if (labels.length === 0) {
      return 'Untitled conversation';
    }

    return labels.join(', ');
  }

  private normalizeUserId(value: unknown): number | null {
    if (typeof value === 'number' && Number.isInteger(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      return Number.isInteger(parsed) ? parsed : null;
    }

    if (
      value &&
      typeof value === 'object' &&
      'id' in value &&
      typeof (value as { id?: unknown }).id !== 'undefined'
    ) {
      return this.normalizeUserId((value as { id?: unknown }).id);
    }

    return null;
  }

  private async resolveChatTitle(participantIds: number[]) {
    const participants = await this.prismaService.user.findMany({
      where: {
        id: {
          in: participantIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return this.buildChatTitle(participants);
  }

  private mapParticipantWithUser(
    rawId: unknown,
    userMap: Map<number, { id: number; name: string | null; email: string }>,
  ) {
    const normalizedId = this.normalizeUserId(rawId);
    const user = normalizedId !== null ? userMap.get(normalizedId) : undefined;

    return {
      id: normalizedId ?? 0,
      name: user?.name || 'Unknown',
      email: user?.email || '',
    };
  }

  async createChat(
    createChatDto: CreateChatDto,
    currentUserId: number,
  ): Promise<Chat> {
    const participantIds = createChatDto.participants.map((id) =>
      parseInt(id, 10),
    );

    if (!participantIds.includes(currentUserId)) {
      participantIds.push(currentUserId);
    }

    const newChat = new this.chatModel({
      title: await this.resolveChatTitle(participantIds),
      participants: participantIds,
      messages: [],
    });

    return await newChat.save();
  }

  async getChats(userId: number): Promise<any[]> {
    const chats = await this.chatModel
      .find({ participants: userId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean()
      .exec();
    const allUserIds = new Set<number>();
    chats.forEach((chat) => {
      chat.participants.forEach((id) => {
        const normalizedId = this.normalizeUserId(id);
        if (normalizedId !== null) {
          allUserIds.add(normalizedId);
        }
      });
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
      title:
        chat.title ||
        this.buildChatTitle(
          chat.participants.map((id) =>
            this.mapParticipantWithUser(id, userMap),
          ),
        ),
      participants: chat.participants.map((id) =>
        this.mapParticipantWithUser(id, userMap),
      ),
    }));

    console.log('chatsWithUserInfo', chatsWithUserInfo);
    return chatsWithUserInfo;
  }

  async addMessage(
    chatId: string,
    userId: number,
    sendMessageDto: SendMessageDto,
  ): Promise<Chat> {
    const message = {
      sender: userId,
      content: sendMessageDto.content,
      timestamp: new Date(),
    };

    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.title) {
      chat.title = await this.resolveChatTitle(chat.participants);
    }

    chat.messages.push(message);

    return await chat.save();
  }

  async getChatById(chatId: string): Promise<any | null> {
    const chat = await this.chatModel.findById(chatId).lean().exec();
    if (!chat) return null;

    const allUserIds = new Set<number>();
    chat.participants.forEach((id) => {
      const normalizedId = this.normalizeUserId(id);
      if (normalizedId !== null) {
        allUserIds.add(normalizedId);
      }
    });
    chat.messages?.forEach((msg: any) => {
      const normalizedId = this.normalizeUserId(msg.sender);
      if (normalizedId !== null) {
        allUserIds.add(normalizedId);
      }
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

    return {
      ...chat,
      title:
        chat.title ||
        this.buildChatTitle(
          chat.participants.map((id) =>
            this.mapParticipantWithUser(id, userMap),
          ),
        ),
      participants: chat.participants.map((id) =>
        this.mapParticipantWithUser(id, userMap),
      ),
      messages: chat.messages?.map((msg: any) => ({
        ...msg,
        sender: {
          ...this.mapParticipantWithUser(msg.sender, userMap),
        },
      })),
    };
  }

  async getChatDetails(chatId: string): Promise<any | null> {
    return this.getChatById(chatId);
  }
}
