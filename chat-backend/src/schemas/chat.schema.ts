import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema()
export class Chat {
  @Prop({ type: String, required: true, default: 'Untitled conversation' })
  title: string;

  @Prop({ type: [Number], required: true })
  participants: number[];

  @Prop({ type: [{ type: Object }], default: [] })
  messages: { sender: number; content: string; timestamp: Date }[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
