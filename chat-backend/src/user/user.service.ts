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

  async searchUsers(
    query: string,
    currentUserId: number,
  ): Promise<{ id: number; name: string; email: string }[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              id: currentUserId,
            },
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 10,
    });

    return users;
  }
}
