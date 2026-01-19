import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;

      console.log(`Client connected: ${client.id}, User ID: ${payload.userId}`);
    } catch (error) {
      console.error('Connection authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const { chatId } = data;
    await client.join(chatId);
    console.log(`User ${client.data.user.userId} joined chat ${chatId}`);
    return { success: true, chatId };
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const { chatId } = data;
    await client.leave(chatId);
    console.log(`User ${client.data.user.userId} left chat ${chatId}`);
    return { success: true, chatId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; content: string },
  ) {
    try {
      const { chatId, content } = data;
      const userId = client.data.user.userId;

      if (!chatId || !content) {
        return { success: false, error: 'Missing chatId or content' };
      }

      // Lưu message vào database
      const message = await this.chatService.addMessage(
        chatId,
        userId,
        content,
      );

      // Broadcast message đến tất cả users trong chat room
      this.server.to(chatId).emit('newMessage', {
        chatId,
        message: {
          sender: userId,
          content,
          timestamp: message.timestamp,
        },
      });

      return { success: true, message };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const { chatId, isTyping } = data;
    const userId = client.data.user.userId;

    // Broadcast typing indicator đến những user khác trong chat
    client.to(chatId).emit('userTyping', {
      chatId,
      userId,
      isTyping,
    });
  }
}
