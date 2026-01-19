import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number): Promise<{ name: string; email: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return {
      name: user.name,
      email: user.email,
    };
  }

  async update(
    id: number,
    data: Prisma.UserUpdateInput,
  ): Promise<{ name: string; email: string } | null> {
    if (data.password) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(data.password as string, salt);
      data.password = hashedPassword;
    }

    if (data.name) {
      data.name = data.name as string;
    }
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });
    return {
      name: updatedUser.name,
      email: updatedUser.email,
    };
  }
}
