import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateChatDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  participants: string[];
}
