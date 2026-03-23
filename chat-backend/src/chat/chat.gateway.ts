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

  private getSocketUserId(client: Socket) {
    const userId = client.data.user?.sub ?? client.data.user?.userId;

    if (typeof userId !== 'number') {
      throw new Error('Invalid socket user');
    }

    return userId;
  }

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

      console.log(`Client connected: ${client.id}, User ID: ${payload.sub}`);
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
    console.log(`User ${this.getSocketUserId(client)} joined chat ${chatId}`);
    return { success: true, chatId };
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const { chatId } = data;
    await client.leave(chatId);
    console.log(`User ${this.getSocketUserId(client)} left chat ${chatId}`);
    return { success: true, chatId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; content: string },
  ) {
    try {
      const { chatId, content } = data;
      const userId = this.getSocketUserId(client);

      if (!chatId || !content) {
        return { success: false, error: 'Missing chatId or content' };
      }

      // Lưu message vào database
      const updatedChat = await this.chatService.addMessage(chatId, userId, {
        content,
      });
      const lastMessage =
        updatedChat.messages[updatedChat.messages.length - 1];

      // Broadcast message đến tất cả users trong chat room
      this.server.to(chatId).emit('newMessage', {
        chatId,
        message: {
          sender: userId,
          content,
          timestamp: lastMessage?.timestamp,
        },
      });

      return { success: true, message: lastMessage };
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
    const userId = this.getSocketUserId(client);

    // Broadcast typing indicator đến những user khác trong chat
    client.to(chatId).emit('userTyping', {
      chatId,
      userId,
      isTyping,
    });
  }

  @SubscribeMessage('videoCallOffer')
  handleVideoCallOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; offer: RTCSessionDescriptionInit },
  ) {
    const userId = this.getSocketUserId(client);

    client.to(data.chatId).emit('videoCallOffer', {
      chatId: data.chatId,
      senderId: userId,
      offer: data.offer,
    });
  }

  @SubscribeMessage('videoCallAnswer')
  handleVideoCallAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; answer: RTCSessionDescriptionInit },
  ) {
    const userId = this.getSocketUserId(client);

    client.to(data.chatId).emit('videoCallAnswer', {
      chatId: data.chatId,
      senderId: userId,
      answer: data.answer,
    });
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; candidate: RTCIceCandidateInit },
  ) {
    const userId = this.getSocketUserId(client);

    client.to(data.chatId).emit('iceCandidate', {
      chatId: data.chatId,
      senderId: userId,
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('endVideoCall')
  handleEndVideoCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = this.getSocketUserId(client);

    client.to(data.chatId).emit('endVideoCall', {
      chatId: data.chatId,
      senderId: userId,
    });
  }
}
