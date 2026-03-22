import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findOne(@Request() req: any): Promise<{ name: string; email: string }> {
    return this.userService.findOne(+req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  searchUsers(@Request() req: any, @Query('q') query: string) {
    const currentUserId = +req.user.id;
    return this.userService.searchUsers(query, currentUserId);
  }
}
